const User = require("../model/user-model");
const { sendOtp, verifyOtp } = require("../api/twilio");

const handleOtpSending = async (req, res) => {
  console.log(req.body);
  const { number } = req.body;
  console.log(number);
  try {
    const user = await User.findOne({ contact: number });
    console.log(user);
    if (!user) {
      return res.status(200).json({
        error: true,
        message:
          "The number is not register with any account please sign in first",
      });
    }
    const status = await sendOtp(number);

    req.session.number = number;

    return res
      .status(200)
      .json({ error: false, message: "Otp has been sended" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleVerifyOtp = async (req, res) => {
  const { otp } = req.body;
  const { number } = req.session;
  console.log(otp, number);
  try {
    const status = await verifyOtp(number, otp);
    if (!status) {
      return res
        .status(200)
        .json({ error: true, message: "The Otp does not match" });
    }

    const user = await User.findOne({ contact: number });
    req.session.user = user;
    return res
      .status(200)
      .json({ error: false, message: "Login has been successfull" });
  } catch (error) {
    res.status(500).json({ message: "Internal sever error" });
  }
};

module.exports = {
  handleOtpSending,
  handleVerifyOtp,
};
