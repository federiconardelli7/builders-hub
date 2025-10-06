export interface StepStatus {
  status: "pending" | "loading" | "success" | "error"
  error?: string
}