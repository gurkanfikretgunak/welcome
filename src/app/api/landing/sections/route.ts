import { NextRequest, NextResponse } from 'next/server'
import { getRequestAccessToken } from '@/lib/mf/client'
import { ENTITY_FIELDS, particular } from '@/lib/repositories/entity'

const save=async(body:any,token:string)=>{
  const data=await particular<{upsertLandingSection:Record<string,any>}>('welcome.landing.write',
    `mutation Save($input:WelcomeEntityInput!){upsertLandingSection(input:$input){${ENTITY_FIELDS}}}`,
    {input:{id:body.id,pageId:body.landing_page_id,sectionType:body.section_type,title:body.title,sortOrder:body.order_index,
      contentJson:JSON.stringify(body)}},token)
  return data.upsertLandingSection
}
export async function POST(request:NextRequest){
  const token=getRequestAccessToken(request);if(!token)return NextResponse.json({error:'Unauthorized'},{status:401})
  try{return NextResponse.json({section:await save(await request.json(),token)},{status:201})}
  catch(error){return NextResponse.json({error:String(error)},{status:500})}
}
export async function PATCH(request:NextRequest){
  const token=getRequestAccessToken(request);if(!token)return NextResponse.json({error:'Unauthorized'},{status:401})
  try{const body=await request.json();if(Array.isArray(body.reorder)){await Promise.all(body.reorder.map((item:any)=>save(item,token)));return NextResponse.json({success:true})}
    return NextResponse.json({section:await save(body,token)})}catch(error){return NextResponse.json({error:String(error)},{status:500})}
}
export async function DELETE(request:NextRequest){
  const token=getRequestAccessToken(request);if(!token)return NextResponse.json({error:'Unauthorized'},{status:401})
  const id=new URL(request.url).searchParams.get('id');if(!id)return NextResponse.json({error:'Section ID is required'},{status:400})
  try{await particular('welcome.landing.write',`mutation D($id:String!){deleteLandingSection(id:$id)}`,{id},token);return NextResponse.json({success:true})}
  catch(error){return NextResponse.json({error:String(error)},{status:500})}
}
