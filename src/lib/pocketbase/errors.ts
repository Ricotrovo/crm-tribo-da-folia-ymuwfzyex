import { ClientResponseError } from 'pocketbase'

export type FieldErrors = Record<string, string>

export function extractFieldErrors(error: unknown): FieldErrors {
  if (!(error instanceof ClientResponseError)) return {}
  const data = error.response?.data
  if (!data || typeof data !== 'object') return {}
  const errors: FieldErrors = {}
  for (const [field, detail] of Object.entries(data)) {
    if (detail && typeof detail === 'object') {
      const code = (detail as any).code
      let msg = (detail as any).message || 'Erro de validação'

      if (code === 'validation_not_unique') {
        msg = 'Este valor já está em uso.'
        if (field === 'email') msg = 'Este e-mail já está em uso.'
        if (field === 'phone') msg = 'Este telefone já está cadastrado.'
      } else if (code === 'validation_required') {
        msg = 'Este campo é obrigatório.'
      } else if (code === 'validation_invalid_email') {
        msg = 'E-mail inválido.'
      }

      errors[field] = msg
    }
  }
  return errors
}

export function getErrorMessage(error: unknown): string {
  if (!(error instanceof ClientResponseError)) {
    return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'
  }
  const errors = extractFieldErrors(error)
  const msgs = Object.values(errors)
  if (msgs.length > 0) {
    return msgs[0] // Return the first specific field error message for the toast
  }
  return error.message || 'Ocorreu um erro inesperado.'
}
