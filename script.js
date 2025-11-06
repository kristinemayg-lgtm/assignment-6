function fetchUserProfile(userId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = {
                id: userId,
                name: "Kristine Garcia",
                email: "kristinemayg@gmail.com",
                username: "kristinemayg"
            };
            resolve(user);
        }, 1000);
    });
}

function fetchUserPosts(userId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const posts = [
                {
                    postId: 1,
                    userId: userId,
                    title: "My First Post",
                    content: "This is the content of my first post."
                },
                {
                    postId: 2,
                    userId: userId,
                    title: "Another Day, Another Post",
                    content: "Here's some more content for my second post."
                },
                {
                    postId: 3,
                    userId: userId,
                    title: "Yet Another Post",
                    content: "Content for the third post goes here."
                }
            ];
            resolve(posts);
        }, 1500);
    });
}

function fetchPostComments(postId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.1) {
                reject(new Error('Failed to fetch comments for post '));
                return;
            }
            const comments = [
                {
                    commentId: 101,
                    postId: postId,
                    username: "commenter1",
                    content: "Great post!"
                },
                {
                    commentId: 102,
                    postId: postId,
                    username: "commenter2",
                    content: "Thanks for sharing."
                },
                {
                    commentId: 103,
                    postId: postId,
                    username: "commenter3",
                    content: "Very informative."
                }
            ];
            resolve(comments);
        }, 2000);
    });
}

async function fetchDataSequentiallyWithErrorHandling(userId) {
    console.log('Starting sequential data fetch...');
    const startTime = Date.now();

    let user = null;
    let posts = [];

    try {
        user = await fetchUserProfile(userId);
        console.log('User profile retreived', user);

        posts = await fetchUserPosts(userId);
        console.log('Posts retreived', posts);

        for (let post of posts) {
            try {
            const comments = await fetchPostComments(post.postId);
            post.comments = comments;
            console.log(`Comments retreived for post X`);
        } catch (commentError) {
            console.error(`Error fetching comments for post ${post.postId}:`, commentError.message);
            post.comments = [];
        }
    }
        const endTime = Date.now();
        console.log(`Sequential fetch took ${endTime - startTime} ms`);
        return { user, posts };
    } catch (error) {
        console.error('Error in sequential fetch:', error.message);
        return { 
            user, 
            posts,
            error: "Data fetch incomplete due to errors."
        };
    }
}

async function fetchDataInParallelWithErrorHandling(userId) {
    console.log('Starting parallel fetch...');  
    const startTime = Date.now();

    let user = null;
    let posts = [];
    try {
        [user, posts] = await Promise.all([
            fetchUserProfile(userId),
            fetchUserPosts(userId)
        ]);
        console.log('User and posts retreived simultaneously');

        const commentPromises = posts.map(post => 
            fetchPostComments(post.postId).catch(err => {
                console.warn(`Error fetching comments for post ${post.postId}:`, err.message);
                return [];
            })
        );

        const allComments = await Promise.all(commentPromises);
        posts.forEach((post, index) => {
            post.comments = allComments[index];
            console.log(`Comments retreived for post ${post.postId}`);
        });
        const endTime = Date.now();
        console.log(`Parallel fetch took ${endTime - startTime} ms`);
        return {
            user,
            posts
        };
    } catch (error) {
        console.error('Error in parallel fetch:', error.message);
        return {
            user,
            posts,
            error: "Data fetch incomplete due to errors."
        };
    }
}

async function getUserContent(userId) {
    console.log('=== Fetching all user content ===');

    try {
        const user = await fetchUserProfile(userId);
        console.log('Step 1: User profile retrieved -', user.name);
        const posts = await fetchUserPosts(userId);
        console.log('Step 2: Posts retrieved -', posts.length);
        const commentPromises = posts.map(post =>
        fetchPostComments(post.postId).catch(err => {
            console.warn('Failed to fetch comments for post ${post.postId}:', err.message);
            return [];
        })
        );
        const allComments = await Promise.all(commentPromises);
        posts.forEach((post, index) => {
            post.comments = allComments[index];
        });
        console.log('Step 3: Comments retreived');

        const allContent = {
            user,
            posts
        };

        return allContent;

    } catch (error) {
            console.error('Failed to fetch user content:', error.message);
            throw error;
        }
    }

    document.getElementById('sequentialBtn').addEventListener('click' , async () => {
        const output = document.getElementById('results');
        output.innerHTML = 'Fetching data sequentially...';

        const data = await fetchDataSequentiallyWithErrorHandling(1);
        output.innerHTML = formatOutput(data);
    })

    document.getElementById('parallelBtn').addEventListener('click' , async () => {
        const output = document.getElementById('results');
        output.innerHTML = 'Fetching data in parallel...';

        const data = await fetchDataInParallelWithErrorHandling(1);
        output.innerHTML = formatOutput(data);
    });

function formatOutput(data) {
    if (!data || !data.user) {
        return `<p>Error: ${data?.error || "No data available"}</p>`;
    }

    let html = `<h2>User: ${data.user.name}</h2>`;
        html += `<p>Email: ${data.user.email}</p>`;
        html += `<p>Username: ${data.user.username}</p>`;
        html += `<h3>Posts:</h3>`;

    data.posts.forEach(post => {
        html += `<div style="margin-bottom: 15px;">
            <strong>${post.title}</strong><br>
            <em>${post.content}</em><br>
            <u>Comments:</u>
            <ul>
                ${post.comments.map(c => `<li><strong>${c.username}:</strong> ${c.comment}</li>`).join('')}
            </ul>
        </div>`;
    });

    if (data.error) {
        html += `<p style="color: red;">Note: ${data.error}</p>`;
    }
    return html;
}

function displayResults(data, container) {
    container.innerHTML = '';

    if (!data || !data.user) {
        const errorMsg = document.createElement('p');
        errorMsg.textContent = `Error: ${data?.error || "No data available"}`;
        errorMsg.style.color = 'red';
        container.appendChild(errorMsg);
        return;
    }
    const userHeader = document.createElement('h2');
    userHeader.textContent = `User: ${data.user.name}`;
    container.appendChild(userHeader);

    const email = document.createElement('p');
    email.textContent = `Email: ${data.user.email}`;
    container.appendChild(email);

    const username = document.createElement('p');
    username.textContent = `Username: ${data.user.username}`;
    container.appendChild(username);

    const postsHeader = document.createElement('h3');
    postsHeader.textContent = 'Posts:';
    container.appendChild(postsHeader);

    data.posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.style.marginBottom = '15px';

        const postTitle = document.createElement('strong');
        postTitle.textContent = post.title;
        postDiv.appendChild(postTitle);

        const postContent = document.createElement('p');
        postContent.innerHTML = `<em>${post.content}</em>`;
        postDiv.appendChild(postContent);

        const commentList = document.createElement('ul');
        post.comments.forEach(comment => {
            const commentItem = document.createElement('li');
            commentItem.innerHTML = `<strong>${comment.username}:</strong> ${comment.content}`;
            commentList.appendChild(commentItem);
        });

        postDiv.appendChild(commentList);
        container.appendChild(postDiv);
    });

    if (data.error) {
        const errorNote = document.createElement('p');
        errorNote.textContent = `Note: ${data.error}`;
        errorNote.style.color = 'red';
        container.appendChild(errorNote);
    }
}