declare namespace IBrowser {
  interface props {
    url?: string
    shown?: () => void
    finish?: () => void
    closed?: () => void
  }

  type stack = any[]
}
