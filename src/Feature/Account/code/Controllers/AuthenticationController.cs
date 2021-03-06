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

using Sitecore.Commerce;

namespace Wooli.Feature.Account.Controllers
{
    using System.Web.Mvc;
    using System.Web.Security;

    using Sitecore.Analytics;
    using Sitecore.Security.Authentication;

    using Wooli.Foundation.Commerce.Context;
    using Wooli.Foundation.Commerce.Models;
    using Wooli.Foundation.Commerce.Models.Authentication;
    using Wooli.Foundation.Commerce.Providers;
    using Wooli.Foundation.Commerce.Repositories;
    using Wooli.Foundation.Extensions.Extensions;

    using Constants = Wooli.Foundation.Commerce.Utils.Constants;

    public class AuthenticationController : Controller
    {
        private readonly ICustomerProvider customerProvider;
        private readonly IVisitorContext visitorContext;

        private readonly ICartRepository cartRepository;

        public AuthenticationController(ICustomerProvider customerProvider, IVisitorContext visitorContext, ICartRepository cartRepository)
        {
            this.customerProvider = customerProvider;
            this.visitorContext = visitorContext;
            this.cartRepository = cartRepository;
        }

        [HttpPost]
        [ActionName("start")]
        public ActionResult ValidateCredentials(UserLoginModel userLogin)
        {

            var validateCredentialsResultDto = new ValidateCredentialsResultModel
            {
                HasValidCredentials = this.ValidateUser(userLogin)
            };

            return this.JsonOk(validateCredentialsResultDto);
        }

        [HttpPost]
        [ActionName("signin")]
        public ActionResult SignIn(UserLoginModel userLogin, string returnUrl)
        {
            bool userLoginResult = this.LoginUser(userLogin, out CommerceUserModel commerceUserModel);

            if (!userLoginResult || commerceUserModel == null)
            {
                return this.Redirect("/signin");
            }

            this.CompleteAuthentication(commerceUserModel);

            return this.RedirectOnSignin(returnUrl);
        }

        [HttpPost]
        [ActionName("signout")]
        public ActionResult SignOut()
        {
            this.visitorContext.CurrentUser = null;

            CommerceTracker.Current.EndVisit(true);
            this.Session.Abandon();
            AuthenticationManager.Logout();
           
            return this.RedirectOnSignin(null);
        }

        private ActionResult RedirectOnSignin(string returnUrl)
        {
            if (string.IsNullOrEmpty(returnUrl))
            {
                return this.Redirect("/");
            }

            return this.Redirect(returnUrl);
        }

        private void CompleteAuthentication(CommerceUserModel commerceUser)
        {

            var anonymousContact = this.visitorContext.ContactId;
            this.visitorContext.CurrentUser = commerceUser;

            this.cartRepository.MergeCarts(anonymousContact);

            CommerceTracker.Current.IdentifyAs("CommerceUser", commerceUser.UserName, (string)null, true);
        }

        private bool ValidateUser(UserLoginModel userLogin)
        {
            var userName = Membership.GetUserNameByEmail(userLogin.Email);
            if (!string.IsNullOrWhiteSpace(userName))
            {
                return Membership.ValidateUser(userName, userLogin.Password);
            }

            return false;
        }


        private bool LoginUser(UserLoginModel userLogin, out CommerceUserModel commerceUser)
        {
            var userName = Membership.GetUserNameByEmail(userLogin.Email);
            if (string.IsNullOrWhiteSpace(userName))
            {
                commerceUser = null;
                return false;
            }

            commerceUser = this.customerProvider.GetCommerceUser(userName);

            if (commerceUser == null)
            {
                return false;
            }

          
            return AuthenticationManager.Login(userName, userLogin.Password);
        }

    }
}
