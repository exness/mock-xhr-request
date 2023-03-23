import {RegisterFunctionArgs, RegisterMockArgs} from './types';

export const areArgsFromFunction = (args: RegisterMockArgs | RegisterFunctionArgs): args is RegisterFunctionArgs => {
  return typeof args[0] === 'function';
};
