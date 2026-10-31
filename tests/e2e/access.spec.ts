import {test,expect} from '@playwright/test'
test('login is available and anonymous record access is rejected',async({page,request})=>{
 await page.goto('/login');await expect(page.getByRole('button',{name:/sign in/i})).toBeVisible()
 for(const resource of ['cases','students','users','interventions','follow-ups']){
  const response=await request.get(`/api/${resource}/00000000-0000-4000-8000-000000000000`)
  expect(response.status()).toBe(401)
 }
})
