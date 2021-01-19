import useRequest from '../../hooks/useRequest';
import Router from 'next/router';

const TicketShow = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: {
      ticketId: ticket.id,
    },
    //to navigate to a wildcard route by Router
    onSuccess: (order) =>
      Router.push('/orders/[orderId]', `/orders/${order.id}`),
  });
  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>{ticket.price}</h4>
      {errors}
      {/*by default the first arg is the event. collaps with the argument is useRequest. here it called without event */}
      <button
        onClick={() => {
          doRequest();
        }}
        className="btn btn-primary"
      >
        Buy
      </button>
    </div>
  );
};

TicketShow.getInitialProps = async (context, client) => {
  //ticketId same like file name. Get query param from url
  const { ticketId } = context.query;
  const { data } = await client.get(`api/tickets/${ticketId}`);

  //return will append to props
  return { ticket: data };
};
export default TicketShow;
