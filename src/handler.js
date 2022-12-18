const { response } = require('@hapi/hapi/lib/validation')
const { fail } = require('assert')
const { request } = require('http')
const {nanoid} = require('nanoid')
const books = require('./books')

// Menambah Buku
const addBookHandler = (request, h) => {
    //Data yang harus di input
    const {name, year, author, summary, publisher, pageCount, readPage, reading} = request.payload 

    const id = nanoid(16)
    const insertedAt = new Date().toISOString()
    var updatedAt = insertedAt
    var finished = (pageCount === readPage)

    // Jika nama buku kosong
    if (name === undefined) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku',
        })
        response.code(400)
        return response
    }

    // Jika readPage lebih besar dari pageCount
    if (readPage > pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        })
        response.code(400)
        return response
    }

    const newBook = {
        id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt
    }

    // Menyimpan buku
    books.push(newBook)


    const isSuccess = books.filter((book) => book.id === id).length > 0

    // Jika sukses menambah buku
    if (isSuccess) {
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: id,
            },
        })
        response.code(201)
        return response
    }

    // Jika gagal menambah buku
    const response = h.response({
        status: 'error',
        message: 'Buku gagal ditambahkan',
    })
    response.code(500)
    return response
}

// Menampilkan semua daftar buku
const getAllBooksHandler = (request, h) => {
    const {name, reading, finished} = request.query

    let filterBook = books

    if (name !== undefined) {
        filterBook = filterBook.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()))
    }

    if (reading !== undefined) {
        filterBook = filterBook.filter((book) => book.reading === !!Number(reading))
    }
    
    if (finished !== undefined) {
        filterBook = filterBook.filter((book) => book.finished === !!Number(finished))
    }

    const response = h.response({
        status: 'success',
        data: {
            books: filterBook.map((book) => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher
            }))
        }
    })
    response.code(200)
    return response
}

// Menampilkan detail buku berdasarkan id buku
const getBookByIdHandler = (request, h) => {
    const {bookId} = request.params

    const book = books.filter((book) => book.id === bookId)[0]

    // Jika id buku yang dimasukan sesuai dengan daftar buku
    if (book !== undefined) {
        const response = h.response({
            status: 'success',
            data: {
                book,
            },
        })
        response.code(200)
        return response 
    } 
    
    // Jika id buku yang dimasukan tidak ada yang sesuai dengan daftar buku
    else {
        const response = h.response({
            status: 'fail',
            message: 'Buku tidak ditemukan',
          });
          response.code(404);
          return response;
    }
}

// Mengubah data buku
const editBookByIdHandler = (request, h) => {
    const {bookId} = request.params

    //Data yang harus di input
    const {name, year, author, summary, publisher, pageCount, readPage, reading} = request.payload

    const index = books.findIndex((book) => book.id === bookId)

    // Jika nama buku kosong
    if (name === undefined) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku'
        })
        response.code(400)
        return response 
    }

    // Jika readPage lebih besar dari pageCount
    if (readPage > pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        })
        response.code(400)
        return response
    }

    // Jika berhasil mengubah data buku
    var updatedAt = new Date().toISOString()

    if (index !== -1) {
        books[index] = {
            ...books[index],name, year, author, summary, publisher, pageCount, readPage, reading, updatedAt
        }

        const response = h.response({
            status: 'success',
            message: 'Buku berhasil diperbarui',
          });
          response.code(200)
          return response
    }

    // Jika gagal mengubah data buku
    const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
      })
      response.code(404)
      return response
}

// Mengapus buku berdasarkan id buku
const deleteBookByIdHandler = (request, h) => {
    const {bookId} = request.params

    const index = books.findIndex((book) => book.id === bookId)

    // Jika buku berhasil dihapus
    if (index !== -1) {
        books.splice(index, 1)
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil dihapus',
          })
          response.code(200)
          return response
    }

    // Jika buku gagal dihapus
    const response = h.response({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan',
      });
      response.code(404);
      return response;
}

module.exports = {
    addBookHandler,
    getAllBooksHandler,
    getBookByIdHandler,
    editBookByIdHandler,
    deleteBookByIdHandler
}