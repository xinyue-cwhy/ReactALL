import mitt from 'mitt'

type Events = {
  'message': string
  'notify': { type: 'success' | 'error' | 'info'; content: string }
  'count-changed': number
}

const emitter = mitt<Events>()

export default emitter
