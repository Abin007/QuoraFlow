import React ,{useState,useEffect,useContext} from 'react';
import {Redirect} from 'react-router-dom';
import Axios from 'axios';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form1 from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import bsCustomFileInput from 'bs-custom-file-input'
import Alert from 'react-bootstrap/Alert'
import { WithContext as ReactTags } from 'react-tag-input';
import { AuthContext } from '../firebase/Auth'
import { useForm } from 'react-hook-form'
import Remove from "./RemoveComponent"

const KeyCodes = {
	comma: 188,
	enter: 13,
  };
   
const delimiters = [KeyCodes.comma, KeyCodes.enter];


function EditForm(props) {
	const [issubmitting ,setissubmitting]=useState(false)
	const { currentUser } = useContext(AuthContext);
	const [ err, seterr ] = useState(false);
	const [errmsg ,seterrmsg]=useState(undefined)
	const [isOwner ,setisOwner] =useState(undefined)
	const [ postData, setpostData]=useState(true);
    const [ getData, setgetData ] = useState({});
	const [image ,selectimage]=useState(null);
	const [oldimage,setoldimage]=useState(undefined);
	const [imagename, setimagename]=useState('');
	const [tags,settags]=useState([ ])
	const { register, errors, handleSubmit } = useForm();
	const [suggestions,]=useState([
	   { id: 'Computer Science', text: 'Computer Science' },
	   { id: 'Electronics', text: 'Electronics' },
	   { id: 'C++', text: 'C++' },
	   { id: 'Node', text: 'Node' },
	   { id: 'NodeJS', text: 'NodeJS' },
	   { id: 'Java', text: 'Java' }
	])
	const [oldtags,setoldtags]=useState([])
    useEffect(
        ()=>{
        console.log("question rendered")
        async function getdata(){
			try{
				let api=process.env.REACT_APP_backendEndpoint + "questions/"+props.match.params.id;
				const { data }= await Axios.get(api)
				setgetData(data)
				setoldimage(data.image)
				if(currentUser!==undefined && data.userid===currentUser.email){
					setisOwner({isowner:true})
				}
				else{
					setisOwner({isowner:false})
				}
				let edittags=[]
				let oldtags=[]
				for(let i=0;i<data.tags.length;i++){
					edittags.push({id:data.tags[i].tag,text:data.tags[i].tag})
					oldtags.push(data.tags[i].tag)
				} 
				
				settags(edittags)
				setoldtags(oldtags)
				if(data.image!==null){
					setimagename(data.image.split('/')[3])
				}

			}
			catch(e){
				setpostData(false)
                if (e.response) {
                        /*
                        * The request was made and the server responded with a
                        * status code that falls out of the range of 2xx
                        */
                    console.log(e.response.data);
                    console.log(e.response.status);
                	console.log(e.response.headers);
                
                }
			}
            
			
        }
        getdata()
        bsCustomFileInput.init()
        


    },[bsCustomFileInput.init()])
    
	const formSubmit = async (event) => {
		//disable form's default behavior
		
			
		try
		{
			setissubmitting(true)
			const formdata= new FormData()
			//get references to form fields.
			let question = document.getElementById('question').value;
			let description = document.getElementById('description').value;
			formdata.append("title",question)
			formdata.append("description",description)
			let tagtext=[]
			
			for (let i in tags){
				
				tagtext.push(tags[i].text.toLowerCase())
			}
			
			formdata.append("tags",tagtext)
			
			if(image !==null){
				formdata.append("image",image)

			}
			else{
				formdata.append("image",oldimage)
			}

			if(currentUser){
				formdata.append("email",currentUser.email)
			}
			for(let i of formdata.entries()){
				console.log(i[0]+" "+i[1])
			}
			
			let i = await currentUser.getIdToken()
			let api=process.env.REACT_APP_backendEndpoint+ "questions/"+props.match.params.id;
			const { data } = await Axios.patch(api, formdata, {
				headers: {
					'accept': 'application/json',
					'Accept-Language': 'en-US,en;q=0.8',
					'Content-Type': 'multipart/form-data',
					'authtoken': i
				}
				
			});

			const tagdata= new FormData()
			tagdata.append("tagarray",tagtext)
			tagdata.append("questionID",data._id)

			const oldtagdata= new FormData()
			oldtagdata.append("questionID",data._id)

			let atagapi=process.env.REACT_APP_backendEndpoint + "tags/removetags";
			await Axios.patch(atagapi,
			{"tagarray":oldtags,"questionID":data._id}
			,{headers: {
					'accept': 'application/json',
					'authtoken': i
			}}		
			)
			let rtagapi=process.env.REACT_APP_backendEndpoint + "tags/addtags";
			await Axios.patch(rtagapi,
			{"tagarray":tagtext,"questionID":data._id},{
				headers: {
					'accept': 'application/json',
					'authtoken': i
				}
				
			})
			props.history.push(`/questions/display/${props.match.params.id}`)
		}
		catch(e){
			setissubmitting(false)
			seterr(true)
			console.log(e)
			if(e.response){
				seterrmsg({msg:e.response.data.error})	
			}
			
			
			// seterrmsg({msg:e.response.data.error})
		}
		
		// document.getElementById('question').value = '';
		// document.getElementById('description').value = '';

		// props.history.push(`/questions/display/${data._id}`)
		
		
        
	};
	const handleimagechange=(e)=>{
		selectimage(e.target.files[0])
	}
	const handleDelete=(i)=>{
        const tag = tags;
		settags(tag.filter((t, index) => index !== i))
	}
	const handleAddition=(tag)=>{
		settags((prevState)=>{
            return[...prevState,tag]
        })
		
    }
    
    const handleTitle=(e)=>{
        const val=e.target.val
        setgetData((prevState)=>{
            return{...prevState,title:val}
        })

    }
    const handleDescription=(e)=>{
        const val=e.target.val
        setgetData((prevState)=>{
            return{...prevState,description:val}
        })

	}
	const handledeleteimage=(e)=>{
		setoldimage(null)
	}

	if (currentUser===undefined) {
			return <Redirect to='/signin'></Redirect>
	}

    if(postData===false){
        return(<Redirect to='/notfound'/>)
	}

	if(getData && getData.isdeleted===true){
        return (<Redirect to='/deleted'/>)

	}
	
	if(isOwner && isOwner.isowner===false){
        return(<Redirect to='/notfound'/>)
    }
	
	
	return (
		<div>
			<Form1 id='simple-form' onSubmit={handleSubmit(formSubmit)} encType="multipart/form-data">
				<Form1.Group>
    			<Form1.Label htmlFor="question">Question</Form1.Label>
    			<Form1.Control id='question' name='question' type="text" value={getData && getData.title} onChange={handleTitle} placeholder="Question Title" ref={register({ required: true, maxLength: 2000,minLength:10 })} />
				{errors.question && <Alert variant={'danger'}>The Question field is required with a min of 10 characters and max of 2000 characters</Alert>}
  				</Form1.Group>
				<Form1.Group>
   				<Form1.Label htmlFor="description">Description</Form1.Label>
    			<Form1.Control as="textarea" rows="3" id='description' name='description' value={getData && getData.description} onChange={ handleDescription}  placeholder="Add a description." ref={register({ required: true, maxLength: 20000,minLength:10 })} />
				{errors.description && <Alert variant={'danger'}>The Description field is required with a min of 10 characters and max of 20000 characters</Alert>}
  				</Form1.Group>
				<Form1.Label>Tags(cannot have duplicate tags and no special characters):</Form1.Label>
				<ReactTags 
					inputFieldPosition="inline"
					tags={tags}
                    suggestions={suggestions}
                    handleDelete={handleDelete}
                    handleAddition={handleAddition}
					delimiters={delimiters}
					removeComponent={Remove}

					 />
				<p className="grey-font">Please press return after typing the tag</p>
				{err?<Alert variant={'danger'}>{errmsg && errmsg.msg}</Alert>:<p></p>}   
				<br/>
				<Form1.Label htmlFor="image1">Optional Image Upload</Form1.Label>
				<br/>
				{oldimage?<div className="ex-image"><p>{imagename}<Button variant="primary" onClick={handledeleteimage}> X</Button></p></div>: null}
				
				<Form1.File id="image1" label="Optional Image Upload" onChange={handleimagechange}   accept="image/*" custom/>  
				<Button disabled={issubmitting} variant="primary" type="submit">
				{issubmitting?"Submitting...":"Submit"}
  				</Button>
			</Form1>
		</div>
		
	);
	
    
} 

export default EditForm;