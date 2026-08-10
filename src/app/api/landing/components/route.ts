import { NextRequest, NextResponse } from 'next/server'
import { getRequestAccessToken } from '@/lib/mf/client'
import { ENTITY_FIELDS, particular } from '@/lib/repositories/entity'

const decode=(row:Record<string,any>)=>{let body:any={};try{body=JSON.parse(row.contentJson||'{}')}catch{}return{id:row.id,...body,
  landing_page_id:row.pageId,component_type:row.sectionType,order_index:row.sortOrder}}
export async function GET(request:NextRequest){
  const pageId=new URL(request.url).searchParams.get('landing_page_id')
  if(!pageId)return NextResponse.json({error:'Landing page ID is required'},{status:400})
  try{const data=await particular<{landingSections:Record<string,any>[]}>('welcome.landing.read',
    `query Sections($pageId:String!){landingSections(pageId:$pageId){${ENTITY_FIELDS}}}`,{pageId},getRequestAccessToken(request))
    return NextResponse.json({components:data.landingSections.map(decode)})}catch(error){return NextResponse.json({error:String(error)},{status:500})}
}
export async function POST(request:NextRequest){
  const token=getRequestAccessToken(request);if(!token)return NextResponse.json({error:'Unauthorized'},{status:401})
  const body=await request.json()
  try{const data=await particular<{upsertLandingSection:Record<string,any>}>('welcome.landing.write',
    `mutation Save($input:WelcomeEntityInput!){upsertLandingSection(input:$input){${ENTITY_FIELDS}}}`,
    {input:{pageId:body.landing_page_id,sectionType:body.component_type,title:body.title,sortOrder:body.order_index,contentJson:JSON.stringify(body)}},token)
    return NextResponse.json({component:decode(data.upsertLandingSection)},{status:201})}catch(error){return NextResponse.json({error:String(error)},{status:500})}
}
