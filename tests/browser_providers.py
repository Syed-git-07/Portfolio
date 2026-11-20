"""Browser integration checks with intercepted provider responses; no real account or email is used."""
import json,time,base64
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
uid='11111111-1111-4111-8111-111111111111'
state={'owner':False,'content':None,'version':0,'send_ok':False,'uploads':0,'publishes':0,'conflict':False}
def token():
 def enc(v):return base64.urlsafe_b64encode(json.dumps(v).encode()).decode().rstrip('=')
 return enc({'alg':'HS256','typ':'JWT'})+'.'+enc({'sub':uid,'role':'authenticated','exp':int(time.time())+3600})+'.test'
def provider(route):
 req=route.request;url=req.url
 status=200;data={}
 if '/auth/v1/token' in url:data={'access_token':token(),'refresh_token':'test-refresh','expires_in':3600,'token_type':'bearer','user':{'id':uid,'email':'owner@example.com','aud':'authenticated','role':'authenticated'}}
 elif '/auth/v1/logout' in url:status=204;data=None
 elif '/rpc/is_portfolio_owner' in url:data=state['owner']
 elif '/rpc/publish_portfolio' in url:
  if state['conflict']:status=409;data={'message':'version_conflict','code':'P0001'}
  else:
   body=req.post_data_json;state['content']=body['new_data'];state['version']+=1;state['publishes']+=1;data=state['version']
 elif '/rest/v1/portfolio_content' in url:data=[] if state['content'] is None else [{'data':state['content'],'version':state['version']}]
 elif '/storage/v1/object/' in url:state['uploads']+=1;data={'Key':'portfolio-media/test.webp'}
 route.fulfill(status=status,content_type='application/json',body='' if data is None else json.dumps(data),headers={'access-control-allow-origin':'*'})
def form(route):
 route.fulfill(status=200 if state['send_ok'] else 502,content_type='application/json',body=json.dumps({'ok':state['send_ok']}),headers={'access-control-allow-origin':'*'})
checks=[]
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1440,'height':1000})
 page.set_default_timeout(5000)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.route('https://portfolio-test.supabase.co/**',provider);page.route('**/api/contact',form)
 page.goto('http://127.0.0.1:5174/#/syed',wait_until='networkidle')
 page.get_by_label('Email',exact=True).fill('owner@example.com');page.get_by_label('Password',exact=True).fill('test-password')
 page.get_by_role('button',name='Sign in',exact=True).click();expect(page.get_by_role('status')).to_contain_text('cannot edit')
 checks.append('non-owner login rejected')
 state['owner']=True;page.get_by_role('button',name='Sign in',exact=True).click();expect(page.get_by_role('button',name='Publish changes')).to_be_visible()
 page.wait_for_timeout(500)
 page.get_by_label('intro',exact=True).fill('Updated through the content studio.')
 page.get_by_role('button',name='pages',exact=True).click();page.get_by_role('button',name='Add page').click()
 page.get_by_label('title',exact=True).fill('Notes');page.get_by_label('body',exact=True).fill('A new page written in the studio.')
 page.get_by_role('button',name='Publish changes').click();expect(page.get_by_role('status')).to_have_text('Published.')
 assert state['publishes']==1
 checks.append('owner edits profile, adds page and publishes')
 page.get_by_role('button',name='profile',exact=True).click()
 upload=page.get_by_label('Upload photo for profile',exact=True)
 upload.set_input_files({'name':'unsafe.svg','mimeType':'image/svg+xml','buffer':b'<svg/>'})
 expect(page.get_by_role('status')).to_contain_text('Choose a PNG')
 assert state['uploads']==0
 upload.set_input_files('public/assets/portrait.webp');expect(page.get_by_role('status')).to_contain_text('Uploaded.')
 assert state['uploads']==1
 checks.append('SVG rejected; valid image processed and uploaded')
 state['conflict']=True;page.get_by_role('button',name='Publish changes').click();expect(page.get_by_role('status')).to_contain_text('newer version')
 checks.append('publish version conflict preserves draft')
 page.on('dialog',lambda d:d.accept());page.get_by_role('button',name='Sign out').click()
 expect(page.get_by_role('button',name='Sign in',exact=True)).to_be_visible()
 checks.append('sign out closes editor')
 page.goto('http://127.0.0.1:5174/',wait_until='networkidle')
 expect(page.locator('.folio-introduction p')).to_contain_text('Updated through the content studio.')
 page.get_by_role('link',name='Notes',exact=True).click();expect(page.locator('.new-custom-page p')).to_have_text('A new page written in the studio.')
 page.get_by_role('link',name='Work',exact=True).click();expect(page.locator('#work')).to_be_in_viewport()
 checks.append('remote published content reloads and custom page navigation works')
 page.get_by_label('Your name').fill('Integration Visitor');page.get_by_label('Email address').fill('test@example.com');page.get_by_label('Message').fill('This is an intercepted integration test.')
 page.get_by_role('button',name='Send message').click();expect(page.locator('.error')).to_contain_text('could not be sent')
 expect(page.get_by_label('Message')).to_have_value('This is an intercepted integration test.')
 checks.append('email provider rejection preserves draft')
 state['send_ok']=True;page.get_by_role('button',name='Send message').click();expect(page.locator('.success')).to_contain_text('Message sent')
 page.wait_for_timeout(3300)
 assert float(page.locator('.sent-stamp').evaluate('(e)=>getComputedStyle(e).opacity'))==1
 page.locator('#contact').screenshot(path='.local/contact-sent.png')
 page.get_by_role('button',name='Write another').click();expect(page.get_by_label('Your name')).to_have_value('')
 expect(page.locator('.letter-scene')).to_have_class('letter-scene writing')
 checks.append('successful response drives envelope completion and reset')
 assert not errors,errors
 b.close()
Path('.local/provider-checks.json').write_text(json.dumps({'passed':checks,'page_errors':errors,'evidence':'Intercepted provider responses, not live service proof'},indent=2))
print(json.dumps(checks))
