import { NextRequest, NextResponse } from 'next/server'
import { getRequestAccessToken } from '@/lib/mf/client'
import { getOrganizationId } from '@/lib/mf/config'
import { ENTITY_FIELDS, particular, toInput } from '@/lib/repositories/entity'

const decode = (row:Record<string,any>) => { let settings={}; try{settings=JSON.parse(row.settingsJson||'{}')}catch{} return {...settings,...row,
  title:row.title,subtitle:(settings as any).subtitle??'',is_active:row.isPublished??false,created_at:row.createdAt,updated_at:row.updatedAt} }
const tokenOr401 = (request:NextRequest) => getRequestAccessToken(request)
export async function GET(request:NextRequest){
  const token=tokenOr401(request);if(!token)return NextResponse.json({error:'Unauthorized'},{status:401})
  try{const data=await particular<{landingPages:Record<string,any>[]}>('welcome.landing.read',
    `query Pages($organizationId:String!){landingPages(organizationId:$organizationId){${ENTITY_FIELDS}}}`,{organizationId:getOrganizationId()},token)
    return NextResponse.json({landingPages:data.landingPages.map(decode)})}catch(error){return NextResponse.json({error:String(error)},{status:500})}
}
export async function POST(request:NextRequest){
  const token=tokenOr401(request);if(!token)return NextResponse.json({error:'Unauthorized'},{status:401})
  const body=await request.json()
  try{const data=await particular<{createLandingPage:Record<string,any>}>('welcome.landing.write',
    `mutation Create($input:WelcomeEntityInput!){createLandingPage(input:$input){${ENTITY_FIELDS}}}`,
    {input:toInput({organizationId:getOrganizationId(),slug:body.title?.toLowerCase().replace(/\W+/g,'-'),title:body.title,
      isPublished:body.is_active,settingsJson:JSON.stringify(body)})},token)
    return NextResponse.json({landingPage:decode(data.createLandingPage)},{status:201})}catch(error){return NextResponse.json({error:String(error)},{status:500})}
}
export async function PATCH(request:NextRequest){
  const token=tokenOr401(request);if(!token)return NextResponse.json({error:'Unauthorized'},{status:401})
  const {id,setActive,...updates}=await request.json()
  try{
    if(setActive){
      const all=await particular<{landingPages:Record<string,any>[]}>('welcome.landing.read',
        `query Pages($organizationId:String!){landingPages(organizationId:$organizationId){${ENTITY_FIELDS}}}`,{organizationId:getOrganizationId()},token)
      await Promise.all(all.landingPages.map(row=>{const old=decode(row);return particular('welcome.landing.write',
        `mutation U($input:WelcomeEntityInput!){updateLandingPage(input:$input){id}}`,
        {input:{id:row.id,isPublished:row.id===id}},token)}))
      return NextResponse.json({success:true})
    }
    const data=await particular<{updateLandingPage:Record<string,any>}>('welcome.landing.write',
      `mutation U($input:WelcomeEntityInput!){updateLandingPage(input:$input){${ENTITY_FIELDS}}}`,
      {input:{id,title:updates.title,isPublished:updates.is_active}},token)
    return NextResponse.json({landingPage:decode(data.updateLandingPage)})
  }catch(error){return NextResponse.json({error:String(error)},{status:500})}
}
export async function DELETE(request:NextRequest){
  const token=tokenOr401(request);if(!token)return NextResponse.json({error:'Unauthorized'},{status:401})
  const id=new URL(request.url).searchParams.get('id');if(!id)return NextResponse.json({error:'Landing page ID is required'},{status:400})
  try{await particular('welcome.landing.write',`mutation D($id:String!){deleteLandingPage(id:$id)}`,{id},token);return NextResponse.json({success:true})}
  catch(error){return NextResponse.json({error:String(error)},{status:500})}
}
