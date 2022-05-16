const axios = require('axios');

const baseURL = 'https://api.conceptnet.io';

//method used for calling concept API
function getData(search, offset, limit) {
    if (!offset) {
        offset = 0;
    }
    if (!limit) {
        limit = 20;
    }
    const url = baseURL + '/c/en/' + search + '?rel=/r/IsA&limit=' + limit + '&offset=' + offset;
    //?rel value doesn't seem to work

    // console.log(url);
    return axios.get(url)
        .then(res => {
            return res.data;
        })
        .catch(error => {
            console.error(error);
        });
}

// actual method to perform logic
const consoleData = async (search, limit) => {
    const data = await getData(search, 0, limit);
    let edges = [];
    let rootNode = data['@id'];

    //remove edges that are not r/IsA
    edges = edges.concat(data.edges).filter((element) => {
        return (element.rel['@id'] === '/r/IsA') && (element.rel['@id'] === '/r/IsA');
    });
    // console.log('data.edges: ', data.edges);


    // console.log('data.view.nextPage: ', data.view.nextPage);
    let offset = 0;
    if(!limit) limit = 20;

    // paginates til we get all the results
    while (data.view && data.view.nextPage) {
        offset = offset + limit;
        let newData = await getData(search, offset, limit);

        //remove edges that are not r/IsA
        edges = edges.concat(newData.edges).filter((element) => {
            return (element.rel['@id'] === '/r/IsA') && (element.rel['@id'] === '/r/IsA');
        });;
        // console.log('newData.view.nextPage: ', newData.view.nextPage);
        // console.log('newData.edges: ', newData.edges);

        if (newData.view.nextPage === undefined) {
            break;
        }


    }

    //removes fields we don't need so it's easier to debug
    let newEdges = edges.map((element)=>{
        return {
            "id": element['@id'],
            "start": {
                "label": element.start.label,
                "general": element.start.term,
            },
            "end": {
                "label": element.end.label,
                "general": element.end.term,
            }
        }
    })

    let graph = {};

    graph[rootNode] = {};
    //TODO how to find root node?
    /*
    Find root node by using graph object. If an edge is pointing TO a node, it's not a root node
     */

    /*
    TODO use directed graph by searching in existing graph object first and pushing down subgraph if concept is an END node?
    I don't understand what direction the edges are returning
     */
    newEdges.forEach((element) => {
        graph[rootNode] [element.end.label] = {};
    });

    //TODO once initial graph is formed, query individual node concepts for direction and relationship to initial concept

    console.log('graph: ', graph);
};


// process arguments
const myArgs = process.argv.slice(2);
// console.log('myArgs: ', myArgs);
let search = myArgs[0];
let limit = myArgs[1];
search = search.replace(' ', '_');


// start app
consoleData(search, limit);







