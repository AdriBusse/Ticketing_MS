import axios from 'axios';

export default ({ req }) => {
  if (typeof window === 'undefined') {
    //we are on server
    return axios.create({
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      //act as a proxy. Takes request from previous and forward it
      //browser do it automaticly
      headers: req.headers,
    });
  } else {
    //we are in browser
    //can make normal request
    return axios.create({
      baseUrl: '/',
    });
  }
};
