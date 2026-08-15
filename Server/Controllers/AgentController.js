const runAgent = require("../AI/Agent/agent");

const chatWithAgent = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim() === "") {
            return res.status(400).json({
                message: "Message is required"
            });
        }

        const answer = await runAgent(
            message,
            req.user._id.toString()
        );

        res.status(200).json({
            answer
        });

    } catch (error) {
        console.error("Agent Error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    chatWithAgent
};