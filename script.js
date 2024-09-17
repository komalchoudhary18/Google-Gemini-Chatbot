const typingForm=document.querySelector(".typing-form")
const toggleThemeButton=document.querySelector("#toggle-theme-button")
const deleteChatButton=document.querySelector("#delete-chat-button")
const chatList=document.querySelector(".chat-list")
const suggestions=document.querySelectorAll(".suggestion-list .suggestion")

let userMessage=null;
let isResponseGenerating=false;

// // API configration 
const API_KEY="AIzaSyBNtTuCDOwXAri7gr249gCZDr9IrpA_S6k";

const API_URL=`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

const loadLocalStorageData =() =>{
    const savedChats= localStorage.getItem("savedChats")
    const isLightMode=(localStorage.getItem("themeColor"==="light_mode"));

    // apply to store theme
    document.body.classList.toggle("light_mode",isLightMode);
    toggleThemeButton.innerText=isLightMode ?"dark_mode" : "light_mode";

    //restore saved chat
    chatList.innerHTML=savedChats || "";

    document.body.classList.toggle("hide-header",savedChats); 
    chatList.scrollTo(0,chatList.scrollHeight); //scroll to bottom
}
      loadLocalStorageData();
// // create a new message element and return it
const createMessageElement= (content,...classes) =>{
    const div=document.createElement("div");
    div.classList.add("message",...classes);
    div.innerHTML=content;
    return div;
}


// // show typing effect by displaying words one by one
const showTypingEffect=(text,textElement,incomingMessageDiv)=>{
    const words=text.split(' ');
    let currentWordsIndex=0;
    const typingInterval=setInterval(() => {

        // append each wordsto the text element with a space
        textElement.innerHTML+=(currentWordsIndex===0 ? '': ' ')+words[currentWordsIndex++];

        incomingMessageDiv.querySelector(".icon").classList.add("hide");
        if(currentWordsIndex===words.length){

            clearInterval( typingInterval);
            isResponseGenerating=false;
            incomingMessageDiv.querySelector(".icon").classList.remove("hide");
            localStorage.setItem("savedChats",chatList.innerHTML) //save chats in local storage

            chatList.scrollTo(0,chatList.scrollHeight); //scroll to bottom
        }
    },75);
}

// fetch response from API based on user message
const generateAPIResponse= async(incomingMessageDiv)=>{
    const textElement =incomingMessageDiv.querySelector(".text");
//     // send post request to the API with user's message
    try{
         const response= await fetch(API_URL,{
            method:"POST",
            headers:{"Content-Type": "application/json"},
            body:JSON.stringify({
                contents:[{
                    role:"user",
                    parts:[{text: userMessage}]
                }]
            })
         });
  
const data= await response.json();

if(!response.ok) throw  new Error(data.error.message);
        //  get api response text
         const apiResponse=data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,'$1');

        showTypingEffect(apiResponse,textElement,incomingMessageDiv);

         } 
         catch(error){
            isResponseGenerating=false;
         textElement.innerText= error.message;
         textElement.classList.add("error");
    } finally {
        incomingMessageDiv.classList.remove("loading");
    }
}

// // show a loading animation while waiting for the API response
 const showLoadingAnimation= () =>{
    const html=`<div class="message content">
    <img src="images/gemini.svg" alt="Gemini Image" class="avatar">
    <p class="text"></p>
    <div class="loading-indicator">
        <div class="loading-bar"></div>
        <div class="loading-bar"></div>
        <div class="loading-bar"></div>
    </div>
     </div>
<span onclick="copyMessage(this)" class=" icon material-symbols-outlined">
    content_copy
    </span> `;
const incomingMessageDiv = createMessageElement(html,"incoming","loading");
chatList.appendChild(incomingMessageDiv);

chatList.scrollTo(0,chatList.scrollHeight); //scroll to bottom
generateAPIResponse(incomingMessageDiv);
 }

//  copy message text to the clipboard
 const copyMessage =(copyIcon) =>{
    const messageText=copyIcon.parentElement.querySelector(".text").innerText;

    navigator.clipboard.writeText(messageText);
    copyIcon.innerText="done";  //show tick icon

    setTimeout(()=>copyIcon.innerText="content_copy",1000); //revert icon after 1 sec

}
// // // handle outgoing message
const handleOutgoingchat= ()=>{
    userMessage=typingForm.querySelector(".typing-input").value.trim() || userMessage;
    if(!userMessage||  isResponseGenerating ) return;
    console.log(userMessage)
    isResponseGenerating=true;

const html=`<div class="message content">
            <img src="images.jpeg" alt="user image" class="avatar">
<p class="text"></p>
 </div>`;
const outgoingMessageDiv = createMessageElement(html,"outgoing");

outgoingMessageDiv.querySelector(".text").innerText=userMessage;
chatList.appendChild(outgoingMessageDiv);

typingForm.reset(); //remove inputfield
chatList.scrollTo(0,chatList.scrollHeight); //scroll to bottom
document.body.classList.add("hide-header");  //hide the header nce chat start
setTimeout(showLoadingAnimation,500);  //show loading animation after a delay

}
// see userMessage and handle outgoing chat when a suggestion is clicked
  suggestions.forEach(suggestion => {
    suggestion.addEventListener("click",()=>{
        userMessage=suggestion.querySelector(".text").innerText;
        handleOutgoingchat();
    });
  });

// toggle between light and dark theme
toggleThemeButton.addEventListener("click", () =>{
  const isLightMode=  document.body.classList.toggle("light_mode");

  localStorage.setItem("themeColor",isLightMode ?"light_mode" : "dark_mode");

  toggleThemeButton.innerText=isLightMode ?"dark_mode" : "light_mode";
});

// delete all chats from local storage when button is clicked
deleteChatButton.addEventListener("click",()=>{
    if(confirm("Are you sure you want to delete all message?"))
     { localStorage.removeItem("savedChats");
    loadLocalStorageData();
}
});

 // prevent default form submission and handle outgoing chat
typingForm.addEventListener("submit",(e)=>{
    e.preventDefault();

  handleOutgoingchat();
});