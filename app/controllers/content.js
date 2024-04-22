const contentModel = require('../models/content')

exports.accessibility = (req, res) => {
  const markdown = contentModel.findOne({
    fileName: 'accessibility'
  })

  res.render('../views/content/show', {
    contentData: markdown.data,
    content: markdown.content
  })
}

exports.cookies = (req, res) => {
  const markdown = contentModel.findOne({
    fileName: 'cookies'
  })

  res.render('../views/content/show', {
    contentData: markdown.data,
    content: markdown.content
  })
}

exports.privacy = (req, res) => {
  const markdown = contentModel.findOne({
    fileName: 'privacy'
  })

  res.render('../views/content/show', {
    contentData: markdown.data,
    content: markdown.content
  })
}

exports.terms = (req, res) => {
  const markdown = contentModel.findOne({
    fileName: 'terms'
  })

  res.render('../views/content/show', {
    contentData: markdown.data,
    content: markdown.content
  })
}

exports.grant = (req, res) => {
  const markdown = contentModel.findOne({
    fileName: 'grant-conditions'
  })

  res.render('../views/content/show', {
    contentData: markdown.data,
    content: markdown.content
  })
}
