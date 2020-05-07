import React ,{useState,useEffect} from 'react';
import {BrowserRouter as Router , Route ,Link,Redirect} from 'react-router-dom';
import Axios from 'axios';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form1 from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'
import bsCustomFileInput from 'bs-custom-file-input'
import { WithContext as ReactTags } from 'react-tag-input';

const KeyCodes = {
	comma: 188,
	enter: 13,
  };
   
const delimiters = [KeyCodes.comma, KeyCodes.enter];


function EditForm(props) {
    const [ getData, setgetData ] = useState({});
	const [image ,selectimage]=useState(null)
	const [tags,settags]=useState([ ])
	const [suggestions,setsuggestions]=useState([
	   { id: 'Computer Science', text: 'Computer Science' },
	   { id: 'Electronics', text: 'Electronics' },
	   { id: 'C++', text: 'C++' },
	   { id: 'Node', text: 'Node' },
	   { id: 'NodeJS', text: 'NodeJS' },
	   { id: 'Java', text: 'Java' }
	])
    useEffect(
        ()=>{
        console.log("question rendered")
        async function getdata(){
            const { data }= await Axios.get(`http://localhost:8080/questions/${props.match.params.id}`)
			setgetData(data)
			let edittags=[]
			for(let i=0;i<data.tags.length;i++){
				edittags.push({id:data.tags[i],text:data.tags[i]})
			} 
			settags(edittags)   
        }
        getdata()
        
        


    },[])
    
	const formSubmit = async (e) => {
        //disable form's default behavior
    
		e.preventDefault();
		
		const formdata= new FormData()
		//get references to form fields.
		let question = document.getElementById('question').value;
		let description = document.getElementById('description').value;
		formdata.append("title",question)
		formdata.append("description",description)
		let tagtext=[]
		
		for (let i in tags){
			
			tagtext.push(tags[i].text)
		}
		
		formdata.append("tags",tagtext)
        
		
		//provide input checking/validation
		//then perhaps post form data to an API or your express server end point
		// let tags=[]
		// let taginfo=document.getElementsByName('tags');
		// for(let i=0;i<taginfo.length;i++){
		// 	if(taginfo[i].type==="checkbox" && taginfo[i].checked===true){
		// 		tags.push(taginfo[i].value)
		// 	}
		// }
		// formdata.append("tags",tags)
		
		// let questioninfo = {
		// 	title:question,
        //     description:description,
		// 	tags:tags,
		// 	image:image,
        //     userid:"2g3bfy46346"
		// };
		// formdata.append("userid","2g3bfy46346")
		if(image !==null){
			formdata.append("image",image)

		}
		
		
		for(let i of formdata.entries()){
			console.log(i[0]+" "+i[1])
		}

		const { data } = await Axios.patch(`http://localhost:8080/questions/${props.match.params.id}`, formdata, {
			headers: {
				'accept': 'application/json',
     			'Accept-Language': 'en-US,en;q=0.8',
     			'Content-Type': 'multipart/form-data',
			   }
			   
		});
		console.log(data)
		props.history.push(`/questions/display/${props.match.params.id}`)
		
		
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
	
	
	return (
		<div>
			<Form1 id='simple-form' onSubmit={formSubmit} encType="multipart/form-data">
				<Form1.Group>
    			<Form1.Label>Question</Form1.Label>
    			<Form1.Control id='question' name='question' type="text" value={getData && getData.title} onChange={handleTitle} placeholder="Question Title" />
  				</Form1.Group>
				<Form1.Group>
   				<Form1.Label>Description</Form1.Label>
    			<Form1.Control as="textarea" rows="3" id='description' name='description' value={getData && getData.description} onChange={ handleDescription}  placeholder="Add a description."/>
  				</Form1.Group>
				<Form1.Label>Tags</Form1.Label>
				<ReactTags 
					inputFieldPosition="inline"
					tags={tags}
                    suggestions={suggestions}
                    handleDelete={handleDelete}
                    handleAddition={handleAddition}
					delimiters={delimiters}

					 />  
				<br/>
				<Form1.Label>Optional Image Upload</Form1.Label>
				<p>{getData && getData.image}</p>
				<Form1.File id="image1" label="Optional Image Upload" onChange={handleimagechange}   accept="image/*" custom/>  
				<Button variant="primary" type="submit">
    				Submit
  				</Button>
			</Form1>
		</div>
		/* // 
		// 	<form id='simple-form' onSubmit={formSubmit}  encType="multipart/form-data">
		// 		<label>
		// 			Question:
		// 			<input id='question' name='question' type='text' value={getData && getData.title} onChange={handleTitle} placeholder='Question Title' />
		// 		</label>
		// 		<br />
		// 		<label>
		// 			Description:
		// 			<textarea id='description' name='description' type='text' value={getData && getData.description} onChange={ handleDescription} placeholder='Desciption' />
		// 		</label>
        //         <br/>
        //         <label>Optional Image :{getData && getData.image}<input name="image" onChange={e => selectimage(e.target.files[0])} type="file" id="image" accept="image/*" /></label>
		// 		<br/>
		// 		<input type='submit' value='Submit' />
				
		// 	</form>
		// </div> */
    );
    
    } 

export default EditForm;