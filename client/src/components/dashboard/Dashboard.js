import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getCurrentUser } from "../../actions/userActions";
import { getCurrentOrg } from "../../actions/orgActions";
import Spinner from "../common/Spinner";

import MonetaryCard from "./MonetaryCard";
import BudgetList from "./BudgetList";
import DoughnutChart from "./Charts/DoughnutChart.js";

//Object to represent Chart Data
var data = {
  labels: [],
  datasets: []
};

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.totalUpArray = this.totalUpArray.bind(this);
    this.accumulateChartData = this.accumulateChartData.bind(this);
  }

  totalUpArray(arr) {
    if (arr.length === 0) {
      return { amount: 0 };
    } else {
      return arr.reduce((a, b) => ({ amount: a.amount + b.amount }));
    }
  }

  componentDidMount() {
    this.props.getCurrentOrg();
  }

  //Takes in array of budget objects and extracts data for the doughnut chart
  accumulateChartData(budgetArray) {
    //Reset Graph data
    //data.labels = [];
    //data.datasets = [];

    //Get titles of budgets
    let budgetTitles = budgetArray.map(a => a.title);
    data.labels = budgetTitles;

    //May need to construct dataset object here and then add to chartData
    let budgetDataSet = {
      label: "budgetchart",
      data: [],
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#AD0000"],
      hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#AD0000"]
    };

    //Get amounts of each budget
    let budgetAmounts = budgetArray.map(a => a.amount);
    budgetDataSet.data = budgetAmounts;
    data.datasets.push(budgetDataSet);
  }

  render() {
    const { user, loading } = this.props.auth;
    const { organization } = this.props.org;

    let dashboardContent;

    if (organization === null || loading) {
      dashboardContent = <Spinner />;
    } else {
      const budgetArray = organization.budgets;

      //Establish Chart Data
      this.accumulateChartData(budgetArray);

      //Ignore warnings that regard this arrow function
      //Filter all NON-revenue items into an array
      const nonRevenueArr = budgetArray.filter(item => {
        if (!item.revenue) {
          return item;
        }
      });

      //Ignore warnings that regard this arrow function
      //Filter all revenue items into an array
      const revenueArr = budgetArray.filter(item => {
        if (item.revenue) {
          return item;
        }
      });

      const totalExpObj = this.totalUpArray(nonRevenueArr);
      const totalRevObj = this.totalUpArray(revenueArr);

      dashboardContent = (
        <div className="row">
          <div className="col-4">
            <div className="row">
              <div className="col-12">
                <h1>Hello {user.firstName}!</h1>
              </div>
            </div>
            <div className="row">
              <div className="col-5">
                <MonetaryCard
                  title="Expenses"
                  value={totalExpObj.amount}
                  colorStyle="Expenses"
                  icon="fas fa-dollar-sign fa-2x text-gray-300"
                />
              </div>
              <div className="col-5">
                <MonetaryCard
                  title="Revenue"
                  value={totalRevObj.amount}
                  colorStyle="Revenues"
                  icon="fas fa-dollar-sign fa-2x text-gray-300"
                />
              </div>
            </div>
            <div className="row">
              <div className="col-10">
                <BudgetList budget={budgetArray} />
              </div>
            </div>
          </div>
          <div className="col-6">
            <DoughnutChart data={data} />
          </div>
        </div>
      );
    }
    return <div>{dashboardContent}</div>;
  }
}

Dashboard.propTypes = {
  getCurrentUser: PropTypes.func.isRequired,
  getCurrentOrg: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  org: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  org: state.org
});

export default connect(
  mapStateToProps,
  { getCurrentUser, getCurrentOrg }
)(Dashboard);
