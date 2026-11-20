from playwright.sync_api import sync_playwright,expect
with sync_playwright() as pw:
 b=pw.chromium.launch();page=b.new_page(viewport={"width":1440,"height":1000});page.goto("http://localhost:5173",wait_until="networkidle");page.wait_for_timeout(1800)
 sheet=page.locator(".folio-portrait");r=sheet.bounding_box();x=r["x"]+r["width"]*.5;y=r["y"]+r["height"]*.4
 page.mouse.move(x,y);page.mouse.down();assert page.locator(".fbill-gl").get_attribute("data-held")=="true"
 page.mouse.move(x+110,y+35,steps=20);page.mouse.up();expect(page.locator(".draped-portrait-cover")).to_have_count(0)
 page.emulate_media(reduced_motion="reduce")
 page.locator("#work").scroll_into_view_if_needed();page.wait_for_timeout(500)
 front=page.locator(".card-swap-slot[data-front]");r=front.bounding_box();x=r["x"]+r["width"]*.5;y=r["y"]+r["height"]*.5
 page.mouse.move(x,y);page.mouse.down();page.mouse.move(x-210,y+40,steps=15);page.mouse.up();page.wait_for_timeout(1500)
 expect(page.locator(".exhibit-caption h3")).to_have_text("NEC Fee Portal");expect(page.get_by_role("dialog")).to_have_count(0)
 page.get_by_role("slider",name="Drag to browse").focus();page.keyboard.press("End");page.wait_for_timeout(2200);expect(page.locator(".exhibit-caption h3")).to_have_text("YouTube UI")
 print("Passed physical sheet removal, card fling and ball keyboard navigation.")
 b.close()
