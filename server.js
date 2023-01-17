const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const Sequelize = require('sequelize');
const { Post } = require('./models');
const { User } = require('./models');
const { Op } = require('sequelize');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
     secret: 'secret',
     resave: false,
     saveUninitialized: true,
     cookie: {
      secure: false,
      maxAge: 2592000000,
     } 
  })
);

//middleware for login check
app.use('/blog',function(req, res, next) {
  if (req.session.user == null){
      console.log("Redirect Middleware");
      return res.render('login');
  } else{
      next();
  }
});

//test for accessibility
app.get('/heartbeat', (req, res) => {
    res.json({
        "is": "working"
    })
});

//login routes
app.get('/login', async(req, res) => {
  res.render('login');
});

app.post('/login', async(req, res) => {
  const user = await User.findAll({
    where: {
      username: {
        [Op.eq]: req.body.username
      }
    }
  });

  bcrypt.compare(req.body.passphrase, user[0].password, function(err, result) {
      if ((result) && (req.body.username === user[0].username)) {
        req.session.user = req.body.username;
        res.redirect('/blog/home');
      } else {
        res.redirect('/failed_login');
      }
  });
});

app.get('/failed_login', async(req, res) => {
  res.render('failed_login');
});

app.get('/create_account', async(req, res) => {
  res.render('create_account');
});

app.post('/create_account', async(req, res) => {
  const user = await User.findAll({
    where: {
      username: {
        [Op.eq]: req.body.username
      }
    }
  });
  if(user[0] == null) {
    bcrypt.hash(req.body.passphrase, 10, function(err, hash) {
        User.create({username: req.body.username, password: hash});
    });
    res.redirect('/blog/home');
  } else {
    res.render('failed_create');
  }
});

app.get('/failed_create', async(req, res) => {
  res.render('failed_create');
});

/* Main app routes */
app.get('/', async(req, res) => {
    res.redirect('/blog/home');
});

app.get('/blog/home', async(req, res) => {
  const post = await Post.findAll({where: {user: {[Op.eq]: req.session.user}},order:[['updatedAt','DESC']]});
  res.render('index', {postArray: post, username: req.session.user});
});

app.delete('/blog/home', async(req, res) => {
    await Post.destroy({
        where: {
          id: req.body.postID
        }
      });
    const post = await Post.findAll({where: {user: {[Op.eq]: req.session.user}},order:[['updatedAt','DESC']]});
    res.render('index', {postArray: post, username: req.session.user});
});

app.post('/blog/home', async(req, res) => {
    const post = await Post.findAll({
        where: {
          category: {[Op.eq]: req.body.category},
          user: {[Op.eq]: req.session.user}
        },
        order:[['updatedAt','DESC']]
    });
    res.render('index', {postArray: post, username: req.session.user});
});

app.get('/blog/newpost', async(req, res) => {
    const newPost = await Post.create({title:"Untitled", isPublished: false, user: req.session.user});
    res.render('newpost', {postId: newPost.id, username: req.session.user});
});

app.post('/blog/newpost', async(req, res) => {
    const postID = parseInt(req.body.postID);

    if(req.body.isPublished !== null) {
        await Post.update({ isPublished: req.body.isPublished }, {
            where: {
              id: postID
            }
          });
    } else {
        if(req.body.category !== null) {
            await Post.update({ title: req.body.title, body: req.body.content, category: req.body.category }, {
                where: {
                id: postID
                }
            });
        } else {
            await Post.update({ title: req.body.title, body: req.body.content }, {
                where: {
                id: postID
                }
            });
        }
        const post = await Post.findAll({where: {user: {[Op.eq]: req.session.user}},order:[['updatedAt','DESC']]});
        res.render('index', {postArray: post, username: req.session.user});
    }   
});

app.post('/blog/editpost', async(req, res) => {
    const post = await Post.findAll({
        where: {
          id: {
            [Op.eq]: req.body.editID
          }
        }
    });
    res.render('editpost', {post: post, username: req.session.user});
});

app.get('/blog/:username', async(req, res) => {
    const post = await Post.findAll({
        where: {isPublished: {[Op.eq]: true},
                user: req.params.username},
        order:[['updatedAt','DESC']]
    });
    res.render("blog",{postArray: post, username: req.session.user});
});

app.post('/blog/viewpost', async(req, res) => {
    const post = await Post.findAll({
        where: {
          id: {
            [Op.eq]: req.body.viewID
          }
        }
    });
    res.render("blog",{postArray: post, username: req.session.user});
});

const server = app.listen(3000, function() {
    console.log('listening on port 3000');
});


