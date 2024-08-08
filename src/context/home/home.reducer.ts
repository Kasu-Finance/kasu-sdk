import {
  HomeActions,
  HomeActionsTypes,
  HomeStateType,
} from '@/context/home/home.types'

const homeReducer = (
  state: HomeStateType,
  action: HomeActions
): HomeStateType => {
  switch (action.type) {
    case HomeActionsTypes.SET_LAYOUT:
      return {
        ...state,
        layout: action.payload,
      }
  }
}

export default homeReducer
