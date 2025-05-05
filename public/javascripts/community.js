document.addEventListener('DOMContentLoaded', function () {
    // Back to top button functionality
    const backToTopBtn = document.getElementById('backToTopBtn');

    // Show/hide back to top button based on scroll position
    window.addEventListener('scroll', function () {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    // Scroll to top when button is clicked
    backToTopBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Category items functionality (left sidebar)
    const categoryItems = document.querySelectorAll('.category-item');

    categoryItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove active class from all category items
            categoryItems.forEach(i => i.classList.remove('active'));

            // Add active class to clicked item
            this.classList.add('active');

            // Get the category name
            const categoryName = this.querySelector('.category-link').textContent.trim();
            console.log('Selected category:', categoryName);

            // Here you would typically fetch posts for the selected category
            fetchPosts({
                category: categoryName
            });
        });
    });

    // Sort functionality (최신순, 정확도순, 등)
    const sortItems = document.querySelectorAll('.sort-item');

    sortItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove active class from all sort items
            sortItems.forEach(i => i.classList.remove('active'));

            // Add active class to clicked item
            this.classList.add('active');

            // Get the sort type
            const sortType = this.querySelector('.sort-link').textContent.trim();
            console.log('Selected sort type:', sortType);

            // Here you would typically sort the posts according to selected type
            fetchPosts({
                sort: sortType
            });
        });
    });

    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const searchCategory = document.getElementById('searchCategory');

    searchBtn.addEventListener('click', function () {
        performSearch();
    });

    // Make enter key work for search
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    function performSearch() {
        const searchTerm = searchInput.value.trim();
        const category = searchCategory.value;

        if (searchTerm) {
            console.log('Searching for:', searchTerm, 'in category:', category);

            // Here you would typically perform a search and update the post list
            fetchPosts({
                search: searchTerm,
                category: category
            });
        }
    }

    // Write button functionality
    const writeBtn = document.getElementById('writeBtn');

    writeBtn.addEventListener('click', function (e) {
        e.preventDefault();

        // Check if user is logged in
        const isLoggedIn = checkUserLoggedIn();

        if (isLoggedIn) {
            // Redirect to write page
            console.log('Redirecting to write page...');
            window.location.href = '/community/write';
        } else {
            // Show login modal
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
        }
    });

    // Initialize post interactions (likes, comments)
    initPostInteractions();

    // Initially hide back to top button
    backToTopBtn.style.display = 'none';
});

// Function to handle post interactions
function initPostInteractions() {
    // Like buttons interaction
    const likeCounts = document.querySelectorAll('.like-count');

    likeCounts.forEach(count => {
        count.addEventListener('click', function (e) {
            e.stopPropagation(); // Prevent post click event

            // Check if user is logged in
            const isLoggedIn = checkUserLoggedIn();

            if (isLoggedIn) {
                // Toggle liked state and update count
                // In a real app, this would send a request to the server
                const currentCount = parseInt(this.textContent);
                this.textContent = currentCount + 1;

                // Add visual feedback
                this.style.color = '#ff5722';
                setTimeout(() => {
                    this.style.color = '#868e96';
                }, 500);

                console.log('Liked post');
            } else {
                // Show login modal
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                loginModal.show();
            }
        });
    });

    // Comment count click
    const commentCounts = document.querySelectorAll('.comment-count');

    commentCounts.forEach(count => {
        count.addEventListener('click', function (e) {
            e.stopPropagation(); // Prevent post click event

            // In a real app, this would scroll to comments or expand comments section
            console.log('Viewing comments');

            // Get the parent post and navigate to detail page with comment section focused
            const postItem = this.closest('.post-item');
            navigateToPostDetail(postItem, true);
        });
    });

    // Post items click to view detail
    const postItems = document.querySelectorAll('.post-item');

    postItems.forEach(post => {
        post.addEventListener('click', function (e) {
            // Don't navigate if clicking on interactive elements
            if (e.target.closest('.like-count') || e.target.closest('.comment-count')) {
                return;
            }

            navigateToPostDetail(this);
        });
    });
}

// Function to navigate to post detail
function navigateToPostDetail(postItem, focusComments = false) {
    // Get post identifier (in a real app, this would be a post ID)
    const userName = postItem.querySelector('.user-name').textContent.split(' ')[0];
    const postDate = postItem.querySelector('.post-date').textContent;

    console.log(`Viewing post by ${userName} from ${postDate}`);

    // In a real app, this would use a post ID and redirect to that post's detail page
    // window.location.href = `/community/post/${postId}${focusComments ? '#comments' : ''}`;

    // For demo purposes, just log the action
    if (focusComments) {
        console.log('...with focus on comments section');
    }
}

// Function to check if user is logged in
function checkUserLoggedIn() {
    // In a real app, this would check for a session or token
    // For demo purposes, return false (user not logged in)
    return true;
}

// Function to fetch posts with filters
function fetchPosts(filters = {}) {
    // In a real app, this would make an AJAX request to fetch filtered posts
    console.log('Fetching posts with filters:', filters);

    // For demo purposes, log the filters
    const {category, sort, search} = filters;

    if (category) {
        console.log(`- Category: ${category}`);
    }

    if (sort) {
        console.log(`- Sort: ${sort}`);
    }

    if (search) {
        console.log(`- Search term: ${search}`);
    }

    // Here you would update the post list with the fetched posts
    console.log('Posts would be updated here');
}