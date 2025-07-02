
import React from 'react';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import {Card,Col} from 'react-bootstrap'
import axios from "axios";
import apiList from '../lib/apiList';
import parse  from 'html-react-parser';

export default class ForgotPasswordForm extends React.Component{
colorRed='color:red'
colorGreen='color:green'

  state = {
    val: "",
    responseMessage:"",
  };

   checkEmail=(event)=>{
    event.preventDefault()
    console.log(this.state.val)
    const emailDetails={email:this.state.val}
    axios.post(apiList.forgotPassword,emailDetails).then((response) => {
      if(response.data.status==200){
        const htmlResponse=`<span style="${this.colorGreen}">${response.data.message}</span>`
        this.setState({responseMessage:htmlResponse})
      }
      else{
        const htmlResponse=`<span style="${this.colorRed}">${response.data.message}</span>`
        this.setState({responseMessage:htmlResponse})

      }

    }).catch((error)=>{
      const htmlError=`<span style="${this.colorRed}">${error}</span>`
      this.setState({responseMessage:htmlError})

      console.log("Error:",error)
    })
  }
    render(){
      return(
        <Col className="container-fluid mt-5 pt-5 mr-5 justify-content-center align-items-center w-0"  >
          <Card border="primary" style={{ width: '22rem',display:"inline-block",      position: 'absolute', 
    left: '50%', 
    top: '50%',
    transform: 'translate(-50%, -50%)' }}>
              <Card.Header className="text-center">Forgot Password</Card.Header>
              <Card.Body>
        <Form onSubmit={this.checkEmail}> 
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control type="email" value={this.state.val} placeholder="Enter email" onChange={e => this.setState({ val: e.target.value })}/>
          <div className='mt-2'>{parse(this.state.responseMessage)}</div>
        </Form.Group>
        <Button className="align-items-center" variant="danger" type="submit">
          Submit
        </Button>
      </Form>
      </Card.Body>
      </Card>
      </Col>
      )
    }
  }
  
  
 
  