import {expect,test} from '@playwright/test';
test('dark default, light toggle and preference survive refresh and demo reset',async({page})=>{
 await page.goto('/');
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByRole('button',{name:'Switch to light mode'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.reload();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.getByRole('button',{name:'Reset Demo',exact:true}).filter({visible:true}).click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.getByRole('button',{name:'Switch to dark mode'}).click();
 await page.reload();
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
});
test('mobile toggle is reachable and works without localStorage',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw Error('disabled')}});
 await page.goto('/');
 await page.getByRole('button',{name:'Switch to light mode'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
