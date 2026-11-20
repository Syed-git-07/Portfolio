"""Interactive portfolio smoke checks. Run normal Vite at localhost:5173."""
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
import json
Path('.local').mkdir(exist_ok=True)
checks=[]
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:5173/',wait_until='networkidle');page.wait_for_timeout(1000)
 expect(page.locator('h1')).to_have_attribute('aria-label','Syed Sufyan')
 page.emulate_media(reduced_motion='reduce');expect(page.locator('.experience')).to_have_class('experience motion-paused')
 page.get_by_role('button',name='Next project',exact=True).click();expect(page.locator('.exhibit-caption h3')).to_have_text('NEC Fee Portal')
 page.get_by_role('button',name='Open NEC Fee Portal',exact=True).click();expect(page.get_by_role('dialog')).to_be_visible();page.keyboard.press('Escape');expect(page.get_by_role('dialog')).to_have_count(0)
 expect(page.get_by_role('button',name='Open NEC Fee Portal',exact=True)).to_be_focused()
 page.get_by_role('button',name='Save NEC Fee Portal on this device').click();expect(page.get_by_role('button',name='Save NEC Fee Portal on this device')).to_have_attribute('aria-pressed','true')
 checks.append('pause, next project, detail dialog, Escape, focus return, local favourite')
 page.get_by_role('button',name='Bar view',exact=True).click();expect(page.locator('.meter-visual')).to_have_class('meter-visual bar')
 page.locator('.meter-legend button').nth(2).focus();expect(page.locator('.meter-number>span').last).to_have_text('Intelligent systems')
 checks.append('context meter view and keyboard category selection')
 page.get_by_role('button',name='Certificate 3: Technical English',exact=True).click();expect(page.locator('.credential-selected h3')).to_have_text('Technical English')
 expect(page.get_by_role('dialog')).to_be_visible();assert page.get_by_role('link',name='Download certificate').get_attribute('href').endswith('.pdf')
 page.keyboard.press('Escape')
 checks.append('certificate stack selection, real preview and PDF')
 page.get_by_role('button',name='Turn over profile card').click();expect(page.locator('.flip-profile')).to_have_class('flip-profile is-flipped')
 page.locator('.timeline-track button').nth(1).click();expect(page.locator('.journey-detail')).to_contain_text('Bell Matric')
 checks.append('profile flip and journey selection')
 page.locator('.folder-front').hover();expect(page.locator('.folder-front')).to_have_attribute('aria-expanded','true')
 page.locator('.folder-document').last.focus();page.keyboard.press('Enter');expect(page.get_by_role('dialog')).to_be_visible();page.keyboard.press('Escape')
 checks.append('archive folder and direct document preview')
 page.keyboard.press('Control+k');expect(page.get_by_role('dialog',name='Search portfolio')).to_be_visible();page.get_by_role('textbox',name='Search portfolio').fill('RiskGuard');page.get_by_role('dialog').get_by_role('button',name='RiskGuard AI').click();expect(page.get_by_role('dialog',name='RiskGuard AI')).to_be_visible();page.keyboard.press('Escape')
 checks.append('command search and project navigation')
 page.get_by_label('Your name').fill('Preview Visitor');page.get_by_label('Email address').fill('preview@example.com');page.get_by_label('Message').fill('A useful project to discuss together.')
 expect(page.locator('.letter-message')).to_have_text('A useful project to discuss together.')
 page.get_by_role('button',name='Send message').click();expect(page.locator('.error')).to_contain_text('not connected')
 expect(page.get_by_label('Message')).to_have_value('A useful project to discuss together.')
 checks.append('live letter sync, unconfigured Gmail rejected, draft retained')
 page.goto('http://127.0.0.1:5173/#/syed');page.get_by_role('button',name='Preview editor').click();page.get_by_role('button',name='pages',exact=True).click();page.get_by_role('button',name='Add page').click();page.get_by_label('title',exact=True).fill('Writing')
 expect(page.get_by_role('button',name='Publish changes')).to_have_count(0)
 checks.append('owner editor preview cannot publish')
 page.close()
 for width in [360,390,768,1440]:
  page=b.new_page(viewport={'width':width,'height':844},reduced_motion='reduce')
  page.goto('http://127.0.0.1:5173/',wait_until='networkidle');page.wait_for_timeout(300)
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),f'overflow {width}'
  page.get_by_role('button',name='Search portfolio',exact=True).click();page.get_by_role('dialog').get_by_role('link',name='Write to me').click();expect(page.locator('#contact')).to_be_in_viewport()
  for y in range(0,13000,700):page.evaluate('(y)=>window.scrollTo(0,y)',y);page.wait_for_timeout(40)
  page.screenshot(path=f'.local/experience-{width}.png',full_page=True)
  page.close();checks.append(f'{width}px layout, reduced motion and navigation')
 assert not errors,errors
 b.close()
Path('.local/ui-checks.json').write_text(json.dumps({'passed':checks,'page_errors':errors},indent=2),encoding='utf-8')
print(json.dumps(checks))

