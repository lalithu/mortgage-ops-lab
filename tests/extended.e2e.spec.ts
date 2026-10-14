import {test,expect} from '@playwright/test';
test('borrower notes and lead status survive refresh; application creates shared loan',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Borrowers',exact:true}).click();
 await page.getByRole('textbox',{name:'Borrower notes'}).fill('Review scheduled Friday.');
 await page.getByRole('textbox',{name:'Borrower notes'}).blur();
 await expect(page.getByRole('status')).toContainText('Borrower saved');
 await page.reload();await page.getByRole('button',{name:'Borrowers',exact:true}).click();
 await expect(page.getByRole('textbox',{name:'Borrower notes'})).toHaveValue('Review scheduled Friday.');
 await page.getByRole('textbox',{name:'Search borrowers'}).fill('Jordan');
 await page.getByRole('button').filter({hasText:'Jordan Ellis'}).click();
 await page.getByRole('button',{name:'Create application',exact:true}).click();
 await expect(page.getByRole('button',{name:'Advance to Processing',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Advance to Processing',exact:true}).click();
 await expect(page.getByRole('button',{name:'Verify income',exact:true})).toBeVisible();
});
test('corrupt storage resets safely and arithmetic fixture is checked',async({page})=>{
 await page.goto('/');await page.evaluate(()=>localStorage.setItem('mortgage-ops-lab:v1','{"version":1,"loans":[]}'));
 await page.reload();await page.getByRole('button',{name:/^AI Review/}).click();
 await page.getByLabel('Recommendation fixture').selectOption('arithmetic');
 await page.getByRole('button',{name:'Validate recommendation',exact:true}).click();
 await expect(page.getByText('ARITHMETIC',{exact:true})).toBeVisible();
 await page.getByLabel('Structured recommendation').fill('{bad');
 await page.getByRole('button',{name:'Validate recommendation',exact:true}).click();
 await expect(page.getByText('INVALID_JSON',{exact:true})).toBeVisible();
});
