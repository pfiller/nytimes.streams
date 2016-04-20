var StreamBox = React.createClass({
  loadNewsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.parseData(data.streams[0].clusters);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadNewsFromServer();
    setInterval(this.loadNewsFromServer, this.props.pollInterval);
  },
  parseData: function(data) {
    var parsedData = data.map(function(jumble){
      var details = jumble.posts[0];
      
      var story = {
        id: jumble.id,
        body: details.summaries[0].body,
        date_created: details.date_created,
        url: details.asset.url
      };

      var imageData = details.display_asset;
      if(imageData){
        story.image = {};
        if(imageData.crops.external){
          story.image.src = imageData.crops.external.url;
        }
        else{
          story.image.src = imageData.crops.thumbStandard.url;
        }
      }

      return story;
    });
    this.setState({data: parsedData});
  },
  render: function() {
    return (
      <div className="streamBox">
        <NewsList data={this.state.data} />
      </div>
    );
  }
});

var NewsList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(news) {
      return (
        <News key={news.id} image={news.image} created={news.date_created} href={news.url}>
          {news.body}
        </News>
      );
    });
    return (
      <ul className="storyList">
        {commentNodes}
      </ul>
    );
  }
});

var News = React.createClass({
  hoursAgo: function() {
    var diff = Math.round(new Date()/1000) - this.props.created;
    var hours = Math.round(diff/60/60);
    if(hours < 24){
      return hours + "h";
    }
    else{
      return Math.floor(hours/24) + "d";
    }
  },
  storyImage: function() {
    if(this.props.image){
      return <img src={this.props.image.src} width="60" height="60" />;
    }
    else{
      return null;
    }
  },
  render: function() {
    return (
      <a href={this.props.href}>
        <li className="story">
          {this.storyImage()}
          <span dangerouslySetInnerHTML={{__html: this.props.children.toString()}} /><br />
          <div className="timeAgo">{this.hoursAgo()}</div>
        </li>
      </a>
    );
  }
});

ReactDOM.render(
  <StreamBox url="http://int.nyt.com/applications/portal/data/v3/streams.json" pollInterval={60000} />,
  document.getElementById('content')
);