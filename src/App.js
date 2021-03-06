import React from 'react';
import blackArrowRight from './blackRightArrow.png'
import blackArrowLeft from './blackLeftArrow.png'
import greyArrowRight from './greyRightArrow.png'
import greyArrowLeft from './greyLeftArrow.png'
import backgroundTiles from './double-bubble-outline.png'
import ReactMarkdown from 'react-markdown'
import {Container, Row, Col} from "react-bootstrap";
import './App.scss';
import { ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';

class App extends React.Component {
  constructor(props) {
      super(props)
      this.state = {postContent: "", postTitles: [], comments: [], postMetadata: "", error: null, currentPost: 1, totalPosts: 3, sideBarCollapsed: true, hideSidebarCollapseButton: false}
      this.handleNextArrowClick = this.handleNextArrowClick.bind(this)
      this.handlePreviousArrowClick = this.handlePreviousArrowClick.bind(this)
      this.closeSidebar = this.closeSidebar.bind(this)
      this.openSidebar = this.openSidebar.bind(this)
      this.fetchPost = this.fetchPost.bind(this)
      this.fetchComments = this.fetchComments.bind(this)
      this.handleSidebarPostClick = this.handleSidebarPostClick.bind(this)
  }

  componentDidMount() {
      fetch("https://adblog.cloudno.de/postTitles", {mode: 'cors'})
        .then(response => response.json())
        .then((result) => {this.setState({postTitles: result})})

      this.fetchPost(1)
      this.fetchComments(1)
  }

  componentDidUpdate(prevProps, prevState, snapshot){
        if(this.state.currentPost !== prevState.currentPost)
        {
          this.fetchPost(this.state.currentPost)
          this.fetchComments(this.state.currentPost)  
        }
  }

  fetchPost(postNumber) {
    var request = "https://adblog.cloudno.de/blog/" + postNumber
    fetch(request, {mode: 'cors'})
          .then(response => response.json())
          .then((result) => {this.setState({postContent: result.content, postMetadata: result.metadata})})
  }

  fetchComments(postNumber) {
    var request = "https://adblog.cloudno.de/comments/" + postNumber 
    fetch(request, {mode: 'cors'})
          .then(response => response.json())
          .then((result) => 
          {
            console.log(result)
            if (result != undefined)
              this.setState({comments: result})
            else
              this.setState({comments: []})
          })
  }

  handleNextArrowClick() {
      if (this.state.currentPost < this.state.totalPosts)
        this.setState((state, props) => ({currentPost: state.currentPost + 1 }))
  }

  handlePreviousArrowClick() {
      if (this.state.currentPost > 1)
        this.setState((state, props) => ({currentPost: state.currentPost - 1}))
  }

  toggleSidebarCollapse()
  {
    this.setState((state, props) => ({sideBarCollapsed: !state.sideBarCollapsed}))
  }

  closeSidebar()
  {
    this.setState((state, props) => ({sideBarCollapsed: true}))
    this.setState((state, props) => ({hideSidebarCollapseButton: false}))
  }

  openSidebar()
  {
    this.setState((state, props) => ({sideBarCollapsed: false}))
    this.setState((state, props) => ({hideSidebarCollapseButton: true}))
  }

  handleSidebarPostClick(post)
  {
    if (post <= this.state.totalPosts && post >= 1)
      this.setState((state, props) => ({currentPost: post}))
  }

  render() {

    const sideBarCollapseButtonHiddenClass = this.state.hideSidebarCollapseButton ? 'hide' : ''
    const sideBarCollapseButtonClasses = `toggleSidebarCollapseButton ${sideBarCollapseButtonHiddenClass}`

    return (

    <div className = "pageContainer">
      <div className = "header">
        <div className = "blogHeader">
          The Bloginer
        </div>
      </div>
      <div className ="mainContentContainer">
        <div className="sideBarWrapper">
          <SideBar sideBarCollapsed = {this.state.sideBarCollapsed} postTitles = {this.state.postTitles} handleClick = {this.handleSidebarPostClick} closeSidebar={this.closeSidebar}/>
        </div>

        <div className="postAndArrowsContainer">
          <div className={sideBarCollapseButtonClasses} onClick={this.openSidebar}>
            All Posts
          </div>

          <ChangePostArrow arrowType = "previousArrow"
                           highlightedImage = {blackArrowLeft}
                           unhighlightedImage = {greyArrowLeft}
                           currentPost = {this.state.currentPost}
                           totalPosts = {this.state.totalPosts} 
                           handleClick= {this.handlePreviousArrowClick} />

          <Post postContent = {this.state.postContent} metaData = {this.state.postMetadata} />

          <ChangePostArrow arrowType = "nextArrow"
                           highlightedImage = {blackArrowRight}
                           unhighlightedImage = {greyArrowRight}
                           currentPost = {this.state.currentPost}
                           totalPosts = {this.state.totalPosts}
                           handleClick= {this.handleNextArrowClick} />


          <SubmitComment postNumber = {this.state.currentPost}/>
          <Comments comments = {this.state.comments} /> 

        </div>
      </div>
    </div>
    )
  }
}

class SideBar extends React.Component {
  constructor(props) {
      super(props)
  }

  render() {
      var posts = []
      for (let i = 0; i <= this.props.postTitles.length; i++)
        posts.push(<MenuItem onClick = {() => this.props.handleClick(i+1)}> {this.props.postTitles[i]} </MenuItem>)

      return (
        <ProSidebar collapsed={this.props.sideBarCollapsed}>
          <div className="closeSidebarButton" onClick={this.props.closeSidebar}>
            Close 
          </div>
          <Menu>
            {posts}
          </Menu>
        </ProSidebar> )
  }
}

class SubmitComment extends React.Component {
  constructor(props) {
      super(props)
      this.state = {value: ''};
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) 
  {    
    this.setState({value: event.target.value});  
  }

  handleSubmit(event) {
      event.preventDefault();
      const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
          body: JSON.stringify({ postNumber: this.props.postNumber, comment: this.state.value, date: "7-13-21"})
      };

      fetch('https://adblog.cloudno.de/newComment', requestOptions)
  }

  render() {
      return (       
        <form className= "submitComment" onSubmit={this.handleSubmit}>
          <label>
            Submit Comment:
            <input type="text" value={this.state.value} onChange={this.handleChange} />
          </label>
          <input type="submit" value="Submit" />
        </form>
        )
  }
}


class ChangePostArrow extends React.Component {

  constructor(props) {
      super(props);
      this.handleMouseHover = this.handleMouseHover.bind(this);
      this.state = { isHovering: false }
  }

  handleMouseHover() {
    this.setState((state, props) => ({isHovering: !state.isHovering}))
  }

  hasAnotherPost() {
    return (this.props.arrowType === "nextArrow" && this.props.currentPost < this.props.totalPosts) || (this.props.arrowType === "previousArrow" && this.props.currentPost > 1)
  }

  chooseImage()
  {
    return this.state.isHovering && this.hasAnotherPost() ? this.props.highlightedImage : this.props.unhighlightedImage
  }

  render() {

    const cursorOnHoverClass = this.hasAnotherPost() ? 'cursorPointerOnHover' : ''
    const arrowClasses = `${this.props.arrowType} ${cursorOnHoverClass}`

    return (
      <img className={arrowClasses}
           src={this.chooseImage()}
           onMouseEnter={this.handleMouseHover}
           onMouseLeave={this.handleMouseHover}
           onClick = {this.props.handleClick} />
    )
  }  
}

class Post extends React.Component {
   render() {
      return (
      <div className="post">
        <PostMetadata data = {this.props.metaData} />
        <ReactMarkdown source = {this.props.postContent} />
      </div>
      );
   }
}

class PostMetadata extends React.Component {
   render() {
      return (
        <div className="metadata">
          <h1 className = "title"> {this.props.data.title} </h1>
          <p className = "author"> by <i> {this.props.data.author} </i> </p>
          <p className = "published-date"> <i> {this.props.data.published} </i> </p>     
        </div>
      );
   }
}

class Comments extends React.Component {
  render() {
      var commentsList = this.props.comments.map((comment) => <li>{comment.date + ": " + comment.comment}</li> );
      return (
        <div className="comments">
          <div> Comments: </div> 
          <ul> {commentsList} </ul> 
        </div>
      )
  }
}

export default App;
