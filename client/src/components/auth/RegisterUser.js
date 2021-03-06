import React, { Component } from "react";
import propTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { registerUser } from "../../actions/authActions";
import TextFieldGroup from "../common/TextFieldGroup";

class RegisterUser extends Component {
  constructor() {
    super();

    this.state = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      password2: "",
      errors: {}
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    //If they are just a user then not allowed
    //eventually we should just not show this option at all
    if (
      this.props.auth.isAuthenticated &&
      this.props.auth.user.role !== "admin"
    ) {
      this.props.history.push("/dashboard");
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({ errors: nextProps.errors });
    }
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  onSubmit(e) {
    e.preventDefault();

    const newUser = {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      email: this.state.email,
      password: this.state.password,
      password2: this.state.password2
    };

    this.props.registerUser(newUser, this.props.history);
  }

  render() {
    const { errors } = this.state;

    return (
      <div className="container">
        <div className="row">
          <div className="card o-hidden border-0 shadow-lg my-5">
            <div className="card-body p-0">
              <div className="row">
                <div className="col-lg-12">
                  <div className="p-5">
                    <div className="text-center">
                      <h1 className="h4 text-gray-900 mb-4">
                        Register a Member
                      </h1>
                    </div>
                    <form className="user" noValidate onSubmit={this.onSubmit}>
                      <div className="form-group row">
                        <div className="col-sm-6 mb-3 mb-sm-0">
                          <TextFieldGroup
                            placeholder=" First Name"
                            name="firstName"
                            value={this.state.firstName}
                            onChange={this.onChange}
                            error={errors.firstName}
                          />
                        </div>
                        <div className="col-sm-6 mb-3 mb-sm-0">
                          <TextFieldGroup
                            placeholder=" Last Name"
                            name="lastName"
                            value={this.state.lastName}
                            onChange={this.onChange}
                            error={errors.lastName}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <TextFieldGroup
                          placeholder=" Email"
                          name="email"
                          value={this.state.email}
                          onChange={this.onChange}
                          error={errors.email}
                        />
                      </div>
                      <div className="form-group row">
                        <div className="col-sm-6 mb-3 mb-sm-0">
                          <TextFieldGroup
                            placeholder=" Password"
                            name="password"
                            type="password"
                            value={this.state.password}
                            onChange={this.onChange}
                            error={errors.password}
                          />
                        </div>
                        <div className="col-sm-6">
                          <TextFieldGroup
                            placeholder=" Confirm Password"
                            name="password2"
                            type="password"
                            value={this.state.password2}
                            onChange={this.onChange}
                            error={errors.password2}
                          />
                        </div>
                      </div>
                      <input
                        type="submit"
                        className="btn btn-primary btn-user btn-block"
                      />
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

RegisterUser.propTypes = {
  registerUser: propTypes.func.isRequired,
  auth: propTypes.object.isRequired,
  errors: propTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  { registerUser }
)(withRouter(RegisterUser));
