import React from 'react';
import blackArrowRight from './blackRightArrow.png'
import blackArrowLeft from './blackLeftArrow.png'
import greyArrowRight from './greyRightArrow.png'
import greyArrowLeft from './greyLeftArrow.png'
import ReactMarkdown from 'react-markdown'
import {Container, Row, Col} from "react-bootstrap";
import './App.scss';
import { ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';

class App extends React.Component {
  constructor(props) {
      super(props)
      this.state = {postContent: "", postMetadata: "", error: null, currentPost: 1, totalPosts: 3, sideBarCollapsed: true}
      this.handleNextArrowClick = this.handleNextArrowClick.bind(this)
      this.handlePreviousArrowClick = this.handlePreviousArrowClick.bind(this)
      this.closeSidebar = this.closeSidebar.bind(this)
      this.openSidebar = this.openSidebar.bind(this)
      this.handleSidebarPostClick = this.handleSidebarPostClick.bind(this)
  }

  componentDidMount() {
      fetch("http://adblog.cloudno.de/blog/1", {mode: 'cors'})
          .then(response => response.json())
          .then((result) => {this.setState({isLoaded: true, postContent: result.content, postMetadata: result.metadata, hideSidebarCollapseButton: false})})
  }

  componentDidUpdate(prevProps, prevState, snapshot){
        if(this.state.currentPost !== prevState.currentPost)
          this.fetchAndDisplayNewPost(this.state.currentPost)    
  }

  fetchAndDisplayNewPost(postNumber) {
    var request = "http://adblog.cloudno.de/blog/" + postNumber
    fetch(request, {mode: 'cors'})
          .then(response => response.json())
          .then((result) => {this.setState({postContent: result.content, postMetadata: result.metadata})})
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
          ADB
        </div>
      </div>
      <div className ="mainContentContainer">
        <div className="sideBarWrapper">
          <SideBar sideBarCollapsed = {this.state.sideBarCollapsed} totalPosts = {this.state.totalPosts} handleClick = {this.handleSidebarPostClick} closeSidebar={this.closeSidebar}/>
        </div>

        <div className="postAndArrowsContainer">
          <div className={sideBarCollapseButtonClasses} onClick={this.openSidebar}>
            Posts
          </div>

          <ChangePostArrow arrowType = "previousArrow"
                           highlightedImage = {blackArrowLeft}
                           unhighlightedImage = {greyArrowLeft}
                           currentPost = {this.state.currentPost}
                           totalPosts = {this.state.totalPosts} 
                           handleClick= {this.handlePreviousArrowClick} />

          <Post postContent = {this.state.postContent} metaData = {this.state.postMetadata}/>

          <ChangePostArrow arrowType = "nextArrow"
                           highlightedImage = {blackArrowRight}
                           unhighlightedImage = {greyArrowRight}
                           currentPost = {this.state.currentPost}
                           totalPosts = {this.state.totalPosts}
                           handleClick= {this.handleNextArrowClick} />
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

      for (let i = 1; i <= this.props.totalPosts; i++)
        posts.push(<MenuItem onClick = {() => this.props.handleClick(i)}> Post {i} </MenuItem>)

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

export default App;
