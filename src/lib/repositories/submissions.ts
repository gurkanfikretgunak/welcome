import { ENTITY_FIELDS, particular, result } from './entity'
export interface Submission { id:string; form_id:string; created_at:string; completed_at:string|null; status:'complete'|'incomplete'; submitter_user_id?:string|null; submitter_email?:string|null; submitter_ip:string; user_agent?:string|null; consent_checked:boolean; consent_text_snapshot:string; rejected_reason?:string|null }
export interface AnswerPayload { question_id:string; value_text?:string|null; value_json?:any; value_number?:number|null; value_date?:string|null; value_time?:string|null; value_email?:string|null; value_url?:string|null; selected_options?:string[]|null; files?:any }

function answerToValueText(a: AnswerPayload): string {
  if (a.value_text != null && a.value_text !== '') return String(a.value_text)
  if (a.value_number != null) return String(a.value_number)
  if (a.value_date) return String(a.value_date)
  if (a.value_time) return String(a.value_time)
  if (a.value_email) return String(a.value_email)
  if (a.value_url) return String(a.value_url)
  if (a.selected_options?.length) return JSON.stringify(a.selected_options)
  if (a.value_json != null) return JSON.stringify(a.value_json)
  if (a.files != null) return JSON.stringify(a.files)
  return ''
}

/** Single-shot submit via Particular `submitForm` (replaces broken Supabase INSERT). */
export async function createSubmission(params:{form_id:string;consent_checked:boolean;submitter_ip:string;user_agent?:string;submitter_email?:string}):
  Promise<{data:Submission|null;error:Error|null}> {
  // Stash for insertAnswers — public form still uses two-step API
  ;(globalThis as any).__welcomePendingSubmission = params
  return {data:{id:'pending',form_id:params.form_id,created_at:new Date().toISOString(),completed_at:null,status:'incomplete',
    submitter_email:params.submitter_email,submitter_ip:params.submitter_ip,consent_checked:params.consent_checked,consent_text_snapshot:''} as Submission,error:null}
}
export async function insertAnswers(_submissionId:string,answers:AnswerPayload[]) {
  const pending=(globalThis as any).__welcomePendingSubmission as {form_id:string;submitter_email?:string}|undefined
  ;(globalThis as any).__welcomePendingSubmission=null
  if(!pending)return{data:null,error:new Error('No pending submission')}
  return result(async()=>{
    const data=await particular<{submitForm:Record<string,any>}>('welcome.forms.write',
      `mutation Submit($input:SubmitWelcomeFormInput!){submitForm(input:$input){${ENTITY_FIELDS}}}`,
      {input:{
        formId:pending.form_id,
        respondentEmail:pending.submitter_email||undefined,
        answers:answers.map(a=>({questionId:a.question_id,valueText:answerToValueText(a)}))
      }})
    return data.submitForm
  })
}
export async function listResponsesForOwner(formId:string){return result(async()=>{const data=await particular<{formSubmissions:Record<string,any>[]}>('welcome.forms.read',
  `query Responses($formId:String!){formSubmissions(formId:$formId){${ENTITY_FIELDS}}}`,{formId})
  // Map Particular entities → owner responses table shape (replaces missing form_responses_owner_view)
  return data.formSubmissions.map((row)=>({
    submission_id: row.id,
    submission_created_at: row.createdAt ?? row.created_at,
    submitter_email: row.respondentEmail ?? row.respondent_email ?? null,
    status: 'complete',
  }))})}
export async function exportResponses(formId:string){return result(async()=>{const data=await particular<{exportFormResponses:string}>('welcome.forms.read',
  `query Export($formId:String!){exportFormResponses(formId:$formId)}`,{formId});const parsed=JSON.parse(data.exportFormResponses);return Array.isArray(parsed)?parsed:[]})}
