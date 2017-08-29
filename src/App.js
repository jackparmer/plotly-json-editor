import React, { Component } from 'react';

import createPlotlyComponent from 'react-plotlyjs';
import fetch from 'isomorphic-fetch';
import Plotly from 'plotly.js/dist/plotly.js';
import ReactJSONEditor from './components/ReactJSONEditor.react.js';
import Select from 'react-select';
import SplitPane from 'react-split-pane';

import './App.css';
import './styles/Resizer.css';

/* JSON Editor styling */
import './styles/autocomplete.css';
import './styles/contextmenu.css';
import './styles/jsoneditor.css';
import './styles/menu.css';
import './styles/reset.css';
import './styles/searchbox.css';

import 'react-select/dist/react-select.css';

class App extends Component {

    constructor(props) {
        super(props);

        this.handleJsonChange = this.handleJsonChange.bind(this);
        this.getPlots = this.getPlots.bind(this);
        this.handleNewPlot = this.handleNewPlot.bind(this);
        
        const plotJSON = {
            data: [{
                x: [1,2,3,4],
                y: [1,3,2,6],
                type: 'bar'
            }, {
                x: [1,2,3,4],
                y: [3,2,7,4],
                type: 'line'
            }],
            layout: {
                margin: {t:0, r: 0, l: 20, b: 20}
            }        
        };

        this.state = {
            json: plotJSON,
            filterByPlotType: {label: 'Any Chart (no filter)', value: ''}
        };
    }
    
    handleJsonChange = newJSON => {
        this.setState({json: newJSON});
    }

    handleNewPlot = option => {
        fetch(option.value)
            .then((response) => response.json())
            .then((newJSON) => {
                if ('height' in newJSON.layout) {
                    newJSON.layout.height = null;
                }
                if ('width' in newJSON.layout) {
                    newJSON.layout.width = null;
                }
                this.setState({json: newJSON});
            });
    }
    
    getPlots = (input) => {
        if (!input && !this.state.filterByPlotType.value) {
			return Promise.resolve({ options: [] });
		}

        let urlToFetch = `https://api.plot.ly/v2/search?q=${input}`;
        
        if (this.state.filterByPlotType) {
            if (this.state.filterByPlotType.value && input) {
                urlToFetch = `https://api.plot.ly/v2/search?q=${input} plottype:${this.state.filterByPlotType.value}`;
            }
            else if (this.state.filterByPlotType.value) {
                urlToFetch = `https://api.plot.ly/v2/search?q=plottype:${this.state.filterByPlotType.value}`;
            }
        }

		return fetch(urlToFetch)
		    .then((response) => response.json())
		    .then((json) => {
			    return { options: json.files.map(function(o) {
                    return {
                        label: `${o.filename} by ${o.owner}, ${o.views} views`,
                        value: o.web_url + '.json'
                    };
                })};
		    });
    };

    handleNewPlotType = option => {
        this.setState({filterByPlotType: option});
    }
    
    render() {

        const PlotlyComponent = createPlotlyComponent(Plotly);    

        const PLOT_TYPES = [
            {label: 'Any chart (no filter)', value: ''},
            {label: 'Bar charts', value: 'bar'},
            {label: 'Line charts', value: 'line'},
            {label: '3d surface charts', value: 'surface'},
            {label: '3d line charts', value: 'line3d'},
            {label: '3d scatter charts', value: 'scatter3d'},
            {label: 'Area charts', value: 'areachart'},
            {label: 'Histograms', value: 'histogram'},
            {label: 'Box Plots', value: 'box'},
            {label: 'Choropleth Maps', value: 'choropleth'},
            {label: 'Mapbox Maps', value: 'scattermapbox'},
            {label: 'Parallel Coordinate Plots', value: 'parcoords'},
            {label: 'Contour Maps', value: 'contour'},
            {label: 'Candlestick Plots', value: 'candlestick'}
        ];

        let searchPlaceholder = 'Search charts on plot.ly';
        if(this.state.filterByPlotType) {
            searchPlaceholder = `Search ${this.state.filterByPlotType.label} on plot.ly`;
        }
        
        return (
            <div className="App">
                <SplitPane split="vertical" minSize={100} defaultSize={400}>
                    <div>
                        <Select
                            name="select plot type"
                            options={PLOT_TYPES}
                            placeholder="Filter by Chart Type"
                            onChange={this.handleNewPlotType}
                            value={this.state.filterByPlotType}
                        />
                        <ReactJSONEditor
                            json={this.state.json}
                            onChange={this.handleJsonChange}
                        />
                    </div>                         
                    <div>
                       <Select.Async
                            name="plot-search-bar"
                            loadOptions={this.getPlots}
                            placeholder={searchPlaceholder}
                            onChange={this.handleNewPlot}
                            ref="plotSearchBar"
                            cache={false}
                       />
                       <PlotlyComponent
                            data={this.state.json.data}
                            layout={this.state.json.layout}
                            config={{displayModeBar: false}}
                        />
                    </div>
                </SplitPane>
            </div>
        );
    }
}

export default App;
