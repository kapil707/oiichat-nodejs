const blogModel = require("../models/blogModel");

async function blogView(req,res) {
    return await blogModel.find({});
}

async function blogInsert(req, res) {
    if (!req.body.title || !req.file) {
        return res.status(400).json({ msg: 'Please enter all required fields and upload an image' });
    }
    try {
        const blogTitle = req.body.title;
        const blogDescription = req.body.description || '';
        const blogImage = `/uploads/${req.file.filename}`;

        // Create a new blog entry
        const result = await blogModel.create({
            title: blogTitle,
            description: blogDescription,
            image: blogImage
        });

        return res.status(201).json({ msg: 'Success', id: result.id });
    } catch (err) {
        return res.status(500).json({ msg: 'Error while adding blog: ' + err.message });
    }
}

async function blogDelete(req, res) {
    try {
        const result = await blogModel.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ msg: 'Blog not found' });
        }
        return res.status(200).json({ msg: 'Success' });
    } catch (err) {
        return res.status(500).json({ msg: 'Error while deleting blog: ' + err.message });
    }
}

async function blogEdit(req, res) {
    try {
        // Find the blog by ID
        const blog = await blogModel.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ msg: 'Blog not found' });
        }
        // Render the edit page with the blog data
        return res.render("./blog/edit", { blog });
    } catch (err) {
        return res.status(500).json({ msg: 'Error fetching blog: ' + err.message });
    }
}

async function blogUpdate(req, res) {
    try {
        // Find the blog by ID and update its fields
        const updatedData = {
            title: req.body.title,
            description: req.body.description
        };
        if (req.file) {
            updatedData.image = `/uploads/${req.file.filename}`; // Update image if a new one is uploaded
        }

        const result = await blogModel.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        if (!result) {
            return res.status(404).json({ msg: 'Blog not found' });
        }
        return res.status(200).json({ msg: 'Blog updated successfully', blog: result });
    } catch (err) {
        return res.status(500).json({ msg: 'Error while updating blog: ' + err.message });
    }
}

module.exports = {
    blogView,
    blogInsert,
    blogDelete,
    blogEdit,
    blogUpdate
};
