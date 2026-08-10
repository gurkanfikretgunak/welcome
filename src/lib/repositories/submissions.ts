import { ENTITY_FIELDS, particular, result } from './entity'
export interface Submission { id:string; form_id:string; created_at:string; completed_at:string|null; status:'complete'|'incomplete'; submitter_user_id?:string|null; submitter_email?:string|null; submitter_ip:string; user_agent?:string|null; consent_checked:boolean; consent_text_snapshot:string; rejected_reason?:string|null }
export interface AnswerPayload { question_id:string; value_text?:string|null; value_json?:any; value_number?:number|null; value_date?:string|null; value_time?:string|null; value_email?:string|null; value_url?:string|null; selected_options?:string[]|null; files?:any }
let pending: { form_id:string; submitter_email?:string } | null = null
export async function createSubmission(params:{form_id:string;consent_checked:boolean;submitter_ip:string;user_agent?:string;submitter_email?:string}):
  Promise<{data:Submission|null;error:Error|null}> {
  pending=params
  return {data:{id:'pending',form_id:params.form_id,created_at:new Date().toISOString(),completed_at:null,status:'incomplete',
    submitter_email:params.submitter_email,submitter_ip:params.submitter_ip,consent_checked:params.consent_checked,consent_text_snapshot:''} as Submission,error:null}
}
export async function insertAnswers(_submissionId:string,answers:AnswerPayload[]) {
  if(!pending)return{data:null,error:new Error('No pending submission')}
  const current=pending;pending=null
  return result(async()=>{const data=await particular<{submitForm:Record<string,any>}>('welcome.forms.write',
    `mutation Submit($input:SubmitWelcomeFormInput!){submitForm(input:$input){${ENTITY_FIELDS}}}`,
    {input:{formId:current.form_id,respondentEmail:current.submitter_email,answers:answers.map(a=>({questionId:a.question_id,valueText:a.value_text??JSON.stringify(a)}))}})
    return data.submitForm})
}
export async function listResponsesForOwner(formId:string){return result(async()=>{const data=await particular<{formSubmissions:Record<string,any>[]}>('welcome.forms.read',
  `query Responses($formId:String!){formSubmissions(formId:$formId){${ENTITY_FIELDS}}}`,{formId});return data.formSubmissions})}
export async function exportResponses(formId:string){return result(async()=>{const data=await particular<{exportFormResponses:string}>('welcome.forms.read',
  `query Export($formId:String!){exportFormResponses(formId:$formId)}`,{formId});const parsed=JSON.parse(data.exportFormResponses);return Array.isArray(parsed)?parsed:[]})}
