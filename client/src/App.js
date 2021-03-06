import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./actions/authActions";
import { Provider } from "react-redux";
import store from "./store";

import Sidebar from "./components/layout/Sidebar";
import RegisterUser from "./components/auth/RegisterUser";
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import BudgetDashboard from "./components/budget/BudgetDashboard";
import AddBudget from "./components/dashboard/AddBudget";
import AddTransaction from "./components/budget/AddTransaction";
import EditTransaction from "./components/budget/EditTransaction";
import EditBudget from "./components/dashboard/EditBudget";

//Private Route
import PrivateRoute from "./components/common/PrivateRoute";
//Admin Route
import AdminRoute from "./components/common/AdminRoute";

import "./App.css";
import RegisterOrg from "./components/auth/RegisterOrg";
import MembersDashboard from "./components/member/MembersDashboard";
import EditMember from "./components/member/EditMember";

// Check for token
if (localStorage.jwtToken) {
  //Set auth token header auth
  setAuthToken(localStorage.jwtToken);
  //Decode token and get user info and exp
  const decoded = jwt_decode(localStorage.jwtToken);
  //Set current user and isAuthenticated
  store.dispatch(setCurrentUser(decoded));

  //Check for expired token
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    //Logout user
    store.dispatch(logoutUser());

    //Redirect to login
    window.location.href = "/";
  }
}

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <div id="wrapper">
              <Sidebar />
              <div id="content-wrapper" className="d-flex flex-column">
                <div id="content">
                  <div className="container-fluid">
                    <Route exact path="/" component={Login} />
                    <Route exact path="/register" component={RegisterOrg} />
                    <Route exact path="/login" component={Login} />
                    <Route
                      exact
                      path="/organizations/register"
                      component={RegisterOrg}
                    />
                    <Route exact path="/organizations/:id" />
                    <Switch>
                      <PrivateRoute
                        exact
                        path="/dashboard"
                        component={Dashboard}
                      />
                    </Switch>
                    <Switch>
                      <AdminRoute
                        exact
                        path="/admin/new-member"
                        component={RegisterUser}
                      />
                    </Switch>
                    <Switch>
                      <AdminRoute
                        exact
                        path="/edit-member"
                        component={EditMember}
                      />
                    </Switch>
                    <Switch>
                      <AdminRoute
                        exact
                        path="/add-budget"
                        component={AddBudget}
                      />
                    </Switch>
                    <Switch>
                      <AdminRoute
                        exact
                        path="/edit-budget"
                        component={EditBudget}
                      />
                    </Switch>

                    <Switch>
                      <PrivateRoute
                        exact
                        path="/budget"
                        component={BudgetDashboard}
                      />
                    </Switch>
                    <Switch>
                      <PrivateRoute
                        exact
                        path="/members"
                        component={MembersDashboard}
                      />
                    </Switch>
                    <Switch>
                      <PrivateRoute
                        exact
                        path="/organizations/budget/transactions" //TODO: Change this route name to fit standard
                        component={AddTransaction}
                      />
                    </Switch>
                    <Switch>
                      <AdminRoute
                        exact
                        path="/edit-transaction"
                        component={EditTransaction}
                      />
                    </Switch>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
