import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/useRequest';
import Router from 'next/router';

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: (payment) => {
      Router.push('/orders');
    },
  });
  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };
    //with () it would pass the result to the setInterval funktion
    findTimeLeft();
    //a time returns a timerId. We need it for clear the intervall after leafe the page
    const timerId = setInterval(findTimeLeft, 1000);

    //return is executed after leave the page
    return () => {
      clearInterval(timerId);
    };
  }, []);

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      {timeLeft} seconds left to pay the your Ticket. Pay now
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        //safe the key in file or as k8s secret
        stripeKey="pk_test_51I8WSxJFIhfIPxJuQwKgqSlLVcMAF7m8sWLOqhnUnLMIrcRpkYPeCG3JjyXKFMhF7Fw3u0FpxXOBnHPpJcNqNm6r00b6UoT6Dv"
        amount={order.ticket.amount * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  //get query from wildcard page
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  //apend to component props
  return { order: data };
};
export default OrderShow;
