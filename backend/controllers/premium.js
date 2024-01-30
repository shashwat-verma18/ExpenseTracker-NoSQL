const Order = require('../models/orderModel');
const Razorpay = require('razorpay');

exports.purchasePremium = async (req, res) => {

    try {
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const amount = 2500;

        rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
            if (err)
                throw new Error(JSON.stringify(err));

            await req.user.createOrder({ orderid: order.id, status: "PENDING" });
            return res.status(201).json({ order, key_id: rzp.key_id });
            
        })
    } catch (err) {
        console.log(err);
        res.status(403).json({ message: "Something went wrong", error: err })
    }
}

exports.updatePrmium = async (req, res) => {

    try {
        const { payment_id, order_id, check } = req.body;


        const order = await Order.findOne({ where: { orderid: order_id } });

        if (check) {

            await order.update({ paymentid: payment_id, status: 'SUCCESSFUL' });
            await req.user.update({ isPremium: true });

            return res.status(202).json({ success: true, message: 'Transaction Successful' });
            
        }
        else {
            await order.update({ paymentid: payment_id, status: 'FAILED' });
            return res.status(202).json({ success: false, message: 'Transaction Failed' });
        }
    } catch (err) {
        throw new Error(err);
    }
}