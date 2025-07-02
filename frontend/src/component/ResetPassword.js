
import React, { useState } from 'react';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { Card, Col } from 'react-bootstrap'
import axios from "axios";
import apiList from '../lib/apiList';
import parse from 'html-react-parser';
import { useParams } from "react-router-dom";

const ResetPasswordForm = (props) => {
  const colorRed = 'color:red'
  const colorGreen = 'color:green'
  const { id, token } = useParams()
  const [responseMessage,setResponseMessage] = useState("")
  const [password , setPassword] = useState()

  const handleReset =(event) =>{
    event.preventDefault()
    console.log("Password:",password)
    axios.post(`${apiList.resetPassword}/`,{id:id,token:token,password:password}).then((result)=>{
      if(result.data.message === "Your Password has been reset.")
      {
        const htmlResponse = `<span style="${colorGreen}">${result.data.message}</span>`
        setResponseMessage(htmlResponse)
      }
      else if(result.data.message==="Invalid User.")
      {
        const htmlResponse = `<span style="${colorRed}">${result.data.message}</span>`
        setResponseMessage(htmlResponse)
      }
      else if(result.data.message ==="Link Has Been Expired.Please Try Again."){
        const htmlResponse = `<span style="${colorRed}">${result.data.message}</span>`
        setResponseMessage(htmlResponse)
      }
      else{
        const htmlResponse =`<span style="${colorRed}>Some Error Occured</span`
        setResponseMessage(htmlResponse)
      }

    })
  }
  return (
    <>
    <Col className="container-fluid mt-5 pt-5 mr-5 justify-content-center align-items-center w-0"  >
      <Card border="primary" style={{
        width: '22rem', display: "inline-block", position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)'
      }}>
        <Card.Header className="text-center">Reset Password</Card.Header>
        <Card.Body>
          <Form onSubmit={handleReset}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Enter New Password</Form.Label>
              <Form.Control type="password" value={password} placeholder="Enter password" onChange={e => setPassword(e.target.value)} />
              <div className='mt-2'>{parse(responseMessage)}</div>
            </Form.Group>
            <Button className="align-items-center" variant="danger" type="submit">
              Reset
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Col>
    </>
  )
}

export default ResetPasswordForm;

