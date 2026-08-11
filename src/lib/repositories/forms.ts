import { getOrganizationId } from '@/lib/mf/config'
import { ENTITY_FIELDS, particular, result, toInput } from './entity'
export type FormStatus = 'active'|'inactive'|'closed'
export type QuestionType = 'short_text'|'long_text'|'multiple_choice'|'checkboxes'|'dropdown'|'url'|'date'|'time'|'email'|'number'|'file_upload'
export interface Form {
  id:string; created_at:string; updated_at:string; created_by:string; owner_user_id:string; title:string
  description?:string|null; slug:string; is_internal:boolean; status:FormStatus; gdpr_consent_text:string
  submission_limit?:number|null; start_at?:string|null; end_at?:string|null; confirmation_message?:string|null
  redirect_url?:string|null; email_notify_on_new_response:boolean; email_summary_frequency:'none'|'daily'|'weekly'
  collect_submitter_email:boolean
}
export interface FormQuestionOption { id:string; question_id:string; order_index:number; label:string; value:string; is_other:boolean }
export interface FormQuestion {
  id:string; form_id:string; created_at:string; updated_at:string; order_index:number; type:QuestionType
  label:string; description?:string|null; required:boolean; settings:any; is_active:boolean; options?:FormQuestionOption[]
}
export interface OwnerDashboardItem { id:string; title:string; slug:string; status:FormStatus; access_type:'Internal'|'Public'; response_count:number; created_at:string; updated_at:string; last_submission_at:string|null }
const parse = (text?: string|null) => { try { return text ? JSON.parse(text) : {} } catch { return {} } }
const mapForm = (row: Record<string,any>): Form => ({ ...parse(row.settingsJson), id:row.id, slug:row.slug,
  title:row.title, description:row.description, created_at:row.createdAt, updated_at:row.updatedAt, created_by:row.createdBy })
const mapOption = (row:Record<string,any>):FormQuestionOption => ({ ...parse(row.settingsJson), id:row.id,
  question_id:row.questionId, order_index:row.sortOrder, label:row.label, value:row.valueText, is_other:false })
const mapQuestion = (row:Record<string,any>):FormQuestion => ({ ...parse(row.settingsJson), id:row.id,
  form_id:row.formId, created_at:row.createdAt, updated_at:row.updatedAt, order_index:row.sortOrder,
  type:row.questionType, label:row.label, required:row.required, settings:parse(row.settingsJson), is_active:true })
async function forms() {
  const data = await particular<{forms:Record<string,any>[]}>('welcome.forms.read',
    `query Forms($organizationId:String!){ forms(organizationId:$organizationId){${ENTITY_FIELDS}} }`,
    {organizationId:getOrganizationId()})
  return data.forms.map(mapForm)
}
async function saveForm(name:string,input:any){return result(async()=>{const data=await particular<Record<string,Record<string,any>>>('welcome.forms.write',
  `mutation Save($input:WelcomeEntityInput!){${name}(input:$input){${ENTITY_FIELDS}}}`,
  {input:toInput({id:input.id,organizationId:getOrganizationId(),title:input.title,description:input.description,slug:input.slug,settingsJson:JSON.stringify(input)})})
  return mapForm(data[name])})}
export const createForm=(input:Partial<Form>)=>saveForm('createForm',input)
export const updateForm=(id:string,input:Partial<Form>)=>saveForm('updateForm',{id,...input})
export const getFormBySlugPublic=async(slug:string)=>result(async()=>(await forms()).find(f=>f.slug===slug)??null)
export const getFormBySlugOwner=getFormBySlugPublic
export const getFormById=async(id:string)=>result(async()=>{const data=await particular<{form:Record<string,any>|null}>('welcome.forms.read',
  `query Form($formId:String!){form(formId:$formId){${ENTITY_FIELDS}}}`,{formId:id});return data.form?mapForm(data.form):null})
export const listMyForms=async()=>result(async()=>(await forms()).map((f):OwnerDashboardItem=>({id:f.id,title:f.title,slug:f.slug,status:f.status,access_type:f.is_internal?'Internal':'Public',response_count:0,created_at:f.created_at,updated_at:f.updated_at,last_submission_at:null})))
export const deleteForm=async(id:string)=>{try{await particular('welcome.forms.write',`mutation D($id:String!){deleteForm(id:$id)}`,{id});return{error:null}}catch(error){return{error:error as Error}}}
export const duplicateForm=async(id:string)=>result(async()=>{const data=await particular<{duplicateForm:Record<string,any>}>('welcome.forms.write',
  `mutation D($formId:String!,$slug:String!){duplicateForm(formId:$formId,slug:$slug){${ENTITY_FIELDS}}}`,{formId:id,slug:`copy-${Date.now()}`});return data.duplicateForm.id})
export async function getFormQuestions(formId:string){return result(async()=>{const data=await particular<{formQuestions:Record<string,any>[]}>('welcome.forms.read',
  `query Q($formId:String!){formQuestions(formId:$formId){${ENTITY_FIELDS}}}`,{formId})
  return Promise.all(data.formQuestions.map(async row=>{const q=mapQuestion(row);const opts=await particular<{formQuestionOptions:Record<string,any>[]}>('welcome.forms.read',
    `query O($questionId:String!){formQuestionOptions(questionId:$questionId){${ENTITY_FIELDS}}}`,{questionId:q.id});q.options=opts.formQuestionOptions.map(mapOption);return q}))})}
async function saveQuestion(input:any){return result(async()=>{const data=await particular<{upsertFormQuestion:Record<string,any>}>('welcome.forms.write',
  `mutation Q($input:WelcomeEntityInput!){upsertFormQuestion(input:$input){${ENTITY_FIELDS}}}`,{input:toInput({id:input.id,formId:input.form_id,
  questionType:input.type,label:input.label,required:input.required,sortOrder:input.order_index,settingsJson:JSON.stringify(input)})});return mapQuestion(data.upsertFormQuestion)})}
export const addQuestion=(formId:string,input:Partial<FormQuestion>)=>saveQuestion({...input,form_id:formId})
export const updateQuestion=(id:string,input:Partial<FormQuestion>)=>saveQuestion({id,...input})
async function saveOption(questionId:string,input:any){return result(async()=>{const data=await particular<{upsertFormQuestionOption:Record<string,any>}>('welcome.forms.write',
  `mutation O($input:WelcomeEntityInput!){upsertFormQuestionOption(input:$input){${ENTITY_FIELDS}}}`,{input:toInput({id:input.id,questionId,label:input.label,
  valueText:input.value,sortOrder:input.order_index,settingsJson:JSON.stringify(input)})});return mapOption(data.upsertFormQuestionOption)})}
export const addQuestionOption=saveOption
export const updateQuestionOption=(id:string,input:Partial<FormQuestionOption>)=>saveOption(input.question_id??'',{id,...input})
export const deleteQuestionOption=async(_id:string)=>({error:new Error('Deleting form options is not supported')})
