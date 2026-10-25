import { ApiType } from './index'

declare global {
  interface Window {
    api: ApiType
  }
}

