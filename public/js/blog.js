document.addEventListener('click', async function(event) {  
    if(event.target.classList.contains('post-button-publish')) {
        let postDOMID = event.target.id;
        let postID = postDOMID.substring(2,postDOMID.length);
        let publishBool;

        if(event.target.classList.contains('publish-button')) {
            event.target.classList.remove('publish-button');
            event.target.classList.add('pill-button');
            publishBool = true;
        } else {
            event.target.classList.remove('pill-button');
            event.target.classList.add('publish-button');
            publishBool = false;
        }
        const response = await fetch('http://localhost:3000/blog/newpost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({postID: postID, title: document.getElementById("postTitle").value, content: document.getElementById("postContent").value, isPublished: publishBool})
        })
        .catch((error) => {
                console.error('Error:', error);
        });
    } else if(event.target.classList.contains('post-button-save')) {
        let postDOMID = event.target.id;
        let postID = postDOMID.substring(2,postDOMID.length);
        let category = null;
        if (document.getElementById("category-select").value !== 'Category') {
            let domCat = document.getElementById("category-select");
            let catIndex = domCat.value;
            category = domCat[catIndex].text;
        }
        const response = await fetch('http://localhost:3000/blog/newpost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({postID: postID, title: document.getElementById("postTitle").value, content: document.getElementById("postContent").value, category: category, isPublished: null})
        })
        .catch((error) => {
                console.error('Error:', error);
        });
        window.location.href = 'http://localhost:3000/blog/home';
    } 
});