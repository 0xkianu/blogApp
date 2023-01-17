document.addEventListener('click', async function(event) { 
    if(event.target.classList.contains('button-delete')) {
        let postDOMID = event.target.id;
        let postID = postDOMID.substring(2,postDOMID.length);
        const response = await fetch('http://localhost:3000/blog/home', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({postID: postID})
        })
        .catch((error) => {
                console.error('Error:', error);
        });
        window.location.href = 'http://localhost:3000/blog/home';
    } 
});
