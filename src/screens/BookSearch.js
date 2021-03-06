import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Debounce } from 'react-throttle';
import * as BooksAPI from '../api/BooksAPI';
import BookList from '../data/BookList';
import AlertContainer from 'react-alert';
import ReactLoading from 'react-loading';

class BookSearch extends Component {
  state = {
    books: [],
    searching: false
  };

  alertOptions = {
    offset: 14,
    position: 'bottom left',
    theme: 'light',
    time: 2000,
    transition: 'scale'
  };

  executeQuery = (query, existingBooks) => {
    if (!query) {
      this.setState({ books: [] });
      return;
    }

    let searching = true;

    this.setState({ searching });

    BooksAPI.search(query.trim(), 20).then(books => {
      if (books.length > 0) {
        searching = false;
        this.updateExistingBooks(books, existingBooks);
        this.setState({ books, searching });
      } else {
        this.setState({ books: [], searching });
      }
    });
  };

  moveBook = (book, shelf) => {
    BooksAPI.update(book, shelf).then(response => {
      if (response) {
        book.shelf = shelf;
        const books = this.state.books.filter(item => book.id !== item.id);
        this.setState({ books });
        this.msg.success(`Book '${book.title}' added to shelf.`);
      }
    });
  };

  updateExistingBooks = (books, existingBooks) => {
    for (let book of books) {
      for (let existingBook of existingBooks) {
        if (book.id === existingBook.id) {
          book.shelf = existingBook.shelf;
        }
      }
    }
  };

  render() {
    const { books, searching } = this.state;
    const existingBooks = this.props.mainState
      ? this.props.mainState.books
      : [];

    return (
      <div className="search-books">
        <div className="search-books-bar">
          <Link className="close-search" to="/">
            Close
          </Link>
          <div className="search-books-input-wrapper">
            <Debounce time="500" handler="onChange">
              <input
                type="text"
                onChange={event =>
                  this.executeQuery(event.target.value, existingBooks)}
                placeholder="Search by title or author"
              />
            </Debounce>
          </div>
        </div>
        <div className="search-books-results">
          {searching
            ? <ReactLoading
                type="spin"
                delay={1}
                color="#6568a4"
                className="loader"
              />
            : <BookList books={books} moveBook={this.moveBook} />}
        </div>
        <div>
          <AlertContainer ref={a => (this.msg = a)} {...this.alertOptions} />
        </div>
      </div>
    );
  }
}

export default BookSearch;
