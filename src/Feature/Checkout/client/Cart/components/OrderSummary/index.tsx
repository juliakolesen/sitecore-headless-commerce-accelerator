//    Copyright 2019 EPAM Systems, Inc.
// 
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { actionTypes, shoppingCart } from 'Feature/Checkout/client/Integration/ShoppingCart';
import * as actions from 'Feature/Checkout/client/Integration/ShoppingCart/actions';
import { LoadingStatus } from 'Foundation/Integration/client';
import { OrderSummaryComponent } from './Component';

import { AppState, OrderSummaryDispatchProps, OrderSummaryOwnProps, OrderSummaryStateProps } from './models';

const mapStateToProps = (state: AppState): OrderSummaryStateProps => {
  const shoppingCartState = shoppingCart(state);
  const adjustments = shoppingCartState && shoppingCartState.data && shoppingCartState.data.adjustments
    ? shoppingCartState.data.adjustments
    : [];
  const isLoading = shoppingCartState.status === LoadingStatus.Loading &&
    shoppingCartState.actionType === actionTypes.ADD_PROMO_CODE_REQUEST;
  const isFailure = shoppingCartState.status === LoadingStatus.Failure &&
    shoppingCartState.actionType === actionTypes.ADD_PROMO_CODE_FAILURE;
  return {
    adjustments,
    isFailure,
    isLoading
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      AddPromoCode: actions.AddPromoCode
    },
    dispatch
  );
};

const connectedToStore = connect<OrderSummaryStateProps, OrderSummaryDispatchProps, OrderSummaryOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(OrderSummaryComponent);

export const OrderSummary = connectedToStore;
