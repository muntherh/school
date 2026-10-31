import {describe,it,expect,vi,beforeEach} from 'vitest'
const mocks=vi.hoisted(()=>({session:vi.fn(),find:vi.fn()}))
vi.mock('@/lib/session',()=>({requireActiveSession:mocks.session}))
vi.mock('@/lib/prisma',()=>({prisma:{case:{findUnique:mocks.find},$disconnect:vi.fn()}}))
import {routeAccess} from '@/lib/route-access'
import {NextRequest} from 'next/server'
describe('API boundary',()=>{
 beforeEach(()=>{mocks.session.mockReset();mocks.find.mockReset()})
 it('rejects anonymous access before querying records',async()=>{mocks.session.mockRejectedValue(Error());expect((await routeAccess(new NextRequest('http://localhost/api/cases/x')))?.status).toBe(401);expect(mocks.find).not.toHaveBeenCalled()})
 it('rejects teacher access to another report',async()=>{mocks.session.mockResolvedValue({role:'TEACHER',userId:'a'});mocks.find.mockResolvedValue({reporterId:'b'});expect((await routeAccess(new NextRequest('http://localhost/api/cases/x')))?.status).toBe(403)})
 it('rejects technical admin case access',async()=>{mocks.session.mockResolvedValue({role:'ADMIN',userId:'a'});expect((await routeAccess(new NextRequest('http://localhost/api/cases')))?.status).toBe(403)})
 it('rejects self role escalation',async()=>{mocks.session.mockResolvedValue({role:'TEACHER',userId:'a'});expect((await routeAccess(new NextRequest('http://localhost/api/users/a',{method:'PATCH',headers:{'content-type':'application/json'},body:'{"role":"PRINCIPAL"}'})))?.status).toBe(403)})
 it('rejects unassigned counsellor access',async()=>{mocks.session.mockResolvedValue({role:'COUNSELLOR',userId:'a'});mocks.find.mockResolvedValue({reporterId:'b',assignedToId:'c'});expect((await routeAccess(new NextRequest('http://localhost/api/cases/x')))?.status).toBe(403)})
})
