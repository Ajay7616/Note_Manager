$(document).ready(function() {
    const loadHome = () => {
        $('#content').html(`
            <h1>Notes Manager</h1>
            <p>Welcome to notes manager, create your day-to-day notes.</p>
        `);
    };

    const loadLogin = () => {
        $('#content').html(`
            <h2>Login</h2>
            <form id="login-form" class="form-container">
                <input type="text" id="login-username" class="input-field" placeholder="Username" required>
                <input type="password" id="login-password" class="input-field" placeholder="Password" required>
                <button type="submit" class="button">Login</button>
            </form>
            <div id="login-error" class="error-message"></div>
        `);

        $(document).on('submit', '#login-form', function(event) {
            event.preventDefault();
            const username = $('#login-username').val().trim();
            const password = $('#login-password').val().trim();

            if (!username || !password) {
                $('#login-error').text('Username and password are required.');
                return;
            }

            $.ajax({
                url: '/login',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ username, password }),
                success: (response) => {
                    localStorage.setItem('token', response.token);
                    updateNavBar();
                    loadHome();
                },
                error: (xhr) => {
                    $('#login-error').text(xhr.responseJSON.message || 'Invalid credentials.');
                }
            });
        });
    };

    const loadRegister = () => {
        $('#content').html(`
            <h2>Register</h2>
            <form id="register-form" class="form-container">
                <input type="text" id="register-username" class="input-field" placeholder="Username" required>
                <input type="password" id="register-password" class="input-field" placeholder="Password" required>
                <button type="submit" class="button">Register</button>
            </form>
            <div id="register-error" class="error-message"></div>
        `);

        $(document).on('submit', '#register-form', function(event) {
            event.preventDefault();
            const username = $('#register-username').val().trim();
            const password = $('#register-password').val().trim();

            if (!username || !password) {
                $('#register-error').text('Username and password are required.');
                return;
            }

            $.ajax({
                url: '/register',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ username, password }),
                success: () => {
                    $('#register-error').text('Registration successful. Please log in.');
                },
                error: (xhr) => {
                    $('#register-error').text(xhr.responseJSON.message || 'Registration failed.');
                }
            });
        });
    };

    const loadNotes = () => {
        $('#content').html(`
            <h2>Notes</h2>
            <div id="notes"></div>
        `);
        fetchNotes();
    };

    const fetchNotes = () => {
        const token = localStorage.getItem('token');
        $.ajax({
            url: '/notes',
            type: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
            success: (notes) => {
                $('#notes').empty();
                notes.forEach(note => {
                    $('#notes').append(`
                        <div class="note-item">
                            <h3>${note.title}</h3>
                            <p>${note.content}</p>
                        </div>
                    `);
                });
            }
        });
    };

    const loadCreateNote = () => {
        $('#content').html(`
            <h2>Create Note</h2>
            <form id="create-note-form" class="form-container">
                <input type="text" id="note-title" class="input-field" placeholder="Title" required>
                <textarea id="note-content" class="input-field" placeholder="Content" required></textarea>
                <button type="submit" class="button">Create Note</button>
            </form>
            <div id="create-note-error" class="error-message"></div>
        `);

        $(document).on('submit', '#create-note-form', function(event) {
            event.preventDefault();
            const title = $('#note-title').val().trim();
            const content = $('#note-content').val().trim();
            const token = localStorage.getItem('token');

            if (!title || !content) {
                $('#create-note-error').text('Title and content are required.');
                return;
            }

            $.ajax({
                url: '/notes',
                type: 'POST',
                contentType: 'application/json',
                headers: { 'Authorization': `Bearer ${token}` },
                data: JSON.stringify({ title, content }),
                success: () => {
                    $('#create-note-error').text('Note created successfully.');
                    loadNotes();
                },
                error: (xhr) => {
                    $('#create-note-error').text(xhr.responseJSON.message || 'Failed to create note.');
                }
            });
        });
    };

    const updateNavBar = () => {
        if (localStorage.getItem('token')) {
            $('#navuser').show();
            $('#nav').hide();
        } else {
            $('#navuser').hide();
            $('#nav').show();
        }
    };

    updateNavBar();
    loadHome();

    $('#home').click((e) => {
        e.preventDefault();
        loadHome();
    });
    $('#login').click((e) => {
        e.preventDefault();
        loadLogin();
    });
    $('#register').click((e) => {
        e.preventDefault();
        loadRegister();
    });
    $('#prev-notes').click((e) => {
        e.preventDefault();
        loadNotes();
    });
    $('#create-note').click((e) => {
        e.preventDefault();
        loadCreateNote();
    });
    $(document).on('click', '#logout', () => {
        localStorage.removeItem('token');
        updateNavBar();
        loadHome();
    });
});
