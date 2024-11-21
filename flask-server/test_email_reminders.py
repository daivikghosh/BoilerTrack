import unittest
from unittest.mock import Mock, patch

from app import create_connection_users, send_mail, send_reminders


class TestSendReminders(unittest.TestCase):
    @patch('app.create_connection_users')
    @patch('app.send_mail')
    def test_send_reminders_no_staff_enabled(self, mock_send_mail, mock_create_connection_users):
        # Mocking the database connection and cursor
        mock_conn = Mock()
        mock_cur = Mock()
        mock_create_connection_users.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cur
        mock_cur.fetchall.return_value = []

        # Running the function
        send_reminders()

        # Assertions
        mock_cur.execute.assert_called_once()
        mock_send_mail.assert_not_called()
        self.assertEqual(mock_send_mail.call_count, 0)

    @patch('app.create_connection_users')
    @patch('app.send_mail')
    def test_send_reminders_with_staff_enabled(self, mock_send_mail, mock_create_connection_users):
        # Mocking the database connection and cursor
        mock_conn = Mock()
        mock_cur = Mock()
        mock_create_connection_users.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cur

        # Mocking the database results
        mock_cur.fetchall.return_value = [
            (1, 'staff1@example.com', 'staff1', 'John Doe', 1, 1, 0),
            (2, 'staff2@example.com', 'staff2', 'Jane Smith', 1, 1, 0)
        ]

        # Running the function
        send_reminders()

        # Assertions
        mock_cur.execute.assert_called_once()
        mock_send_mail.assert_called_once()

        # Unpacking email pairs for easier assertions
        args, _ = mock_send_mail.call_args
        email_pairs = args[0]

        self.assertEqual(len(email_pairs), 2)
        self.assertEqual(email_pairs[0][0], 'staff1@example.com')
        self.assertIn("Hello there, John!", email_pairs[0][1])
        self.assertEqual(email_pairs[1][0], 'staff2@example.com')
        self.assertIn("Hello there, Jane!", email_pairs[1][1])

    @patch('app.create_connection_users')
    @patch('app.send_mail')
    def test_send_reminders_with_disabled_staff(self, mock_send_mail, mock_create_connection_users):
        # Mocking the database connection and cursor
        mock_conn = Mock()
        mock_cur = Mock()
        mock_create_connection_users.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cur

        # Mocking the database results
        mock_cur.fetchall.return_value = [
            (1, 'staff1@example.com', 'staff1', 'John Doe', 1, 0, 0),
            (2, 'staff2@example.com', 'staff2', 'Jane Smith', 1, 1, 0)
        ]

        # Running the function
        send_reminders()

        # Assertions
        mock_cur.execute.assert_called_once()
        mock_send_mail.assert_called_once()

        # Unpacking email pairs for easier assertions
        args, _ = mock_send_mail.call_args
        email_pairs = args[0]

        self.assertEqual(len(email_pairs), 1)
        self.assertEqual(email_pairs[0][0], 'staff2@example.com')
        self.assertIn("Hello there, Jane!", email_pairs[0][1])

    @patch('app.create_connection_users')
    @patch('app.send_mail')
    def test_send_reminders_with_deleted_staff(self, mock_send_mail, mock_create_connection_users):
        # Mocking the database connection and cursor
        mock_conn = Mock()
        mock_cur = Mock()
        mock_create_connection_users.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cur

        # Mocking the database results
        mock_cur.fetchall.return_value = [
            (1, 'staff1@example.com', 'staff1', 'John Doe', 1, 1, 1),
            (2, 'staff2@example.com', 'staff2', 'Jane Smith', 1, 1, 0)
        ]

        # Running the function
        send_reminders()

        # Assertions
        mock_cur.execute.assert_called_once()
        mock_send_mail.assert_called_once()

        # Unpacking email pairs for easier assertions
        args, _ = mock_send_mail.call_args
        email_pairs = args[0]

        self.assertEqual(len(email_pairs), 1)
        self.assertEqual(email_pairs[0][0], 'staff2@example.com')
        self.assertIn("Hello there, Jane!", email_pairs[0][1])

    @patch('app.create_connection_users')
    @patch('app.send_mail')
    def test_send_reminders_with_no_staff(self, mock_send_mail, mock_create_connection_users):
        # Mocking the database connection and cursor
        mock_conn = Mock()
        mock_cur = Mock()
        mock_create_connection_users.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cur

        # Mocking the database results
        mock_cur.fetchall.return_value = []

        # Running the function
        send_reminders()

        # Assertions
        mock_cur.execute.assert_called_once()
        mock_send_mail.assert_not_called()
        mock_conn.cursor.assert_called_once()
        mock_conn.close.assert_called_once()

    def tearDown(self):
        # Any tear down operations can be added here
        pass


if __name__ == '__main__':
    unittest.main()
import unittest
from unittest.mock import patch, Mock
from app import send_reminders, create_connection_users, send_mail


class TestSendReminders(unittest.TestCase):
    @patch('app.create_connection_users')
    @patch('app.send_mail')
    def test_send_reminders_no_staff_enabled(self, mock_send_mail, mock_create_connection_users):
        # Mocking the database connection and cursor
        mock_conn = Mock()
        mock_cur = Mock()
        mock_create_connection_users.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cur
        mock_cur.fetchall.return_value = []

        # Running the function
        send_reminders()

        # Assertions
        mock_cur.execute.assert_called_once()
        mock_send_mail.assert_not_called()
        self.assertEqual(mock_send_mail.call_count, 0)

    @patch('app.create_connection_users')
    @patch('app.send_mail')
    def test_send_reminders_with_staff_enabled(self, mock_send_mail, mock_create_connection_users):
        # Mocking the database connection and cursor
        mock_conn = Mock()
        mock_cur = Mock()
        mock_create_connection_users.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cur

        # Mocking the database results
        mock_cur.fetchall.return_value = [
            (1, 'staff1@example.com', 'staff1', 'John Doe', 1, 1, 0),
            (2, 'staff2@example.com', 'staff2', 'Jane Smith', 1, 1, 0)
        ]

        # Running the function
        send_reminders()

        # Assertions
        mock_cur.execute.assert_called_once()
        mock_send_mail.assert_called_once()

        # Unpacking email pairs for easier assertions
        args, _ = mock_send_mail.call_args
        email_pairs = args[0]

        self.assertEqual(len(email_pairs), 2)
        self.assertEqual(email_pairs[0][0], 'staff1@example.com')
        self.assertIn("Hello there, John!", email_pairs[0][1])
        self.assertEqual(email_pairs[1][0], 'staff2@example.com')
        self.assertIn("Hello there, Jane!", email_pairs[1][1])

    @patch('app.create_connection_users')
    @patch('app.send_mail')
    def test_send_reminders_with_disabled_staff(self, mock_send_mail, mock_create_connection_users):
        # Mocking the database connection and cursor
        mock_conn = Mock()
        mock_cur = Mock()
        mock_create_connection_users.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cur

        # Mocking the database results
        mock_cur.fetchall.return_value = [
            (1, 'staff1@example.com', 'staff1', 'John Doe', 1, 0, 0),
            (2, 'staff2@example.com', 'staff2', 'Jane Smith', 1, 1, 0)
        ]

        # Running the function
        send_reminders()

        # Assertions
        mock_cur.execute.assert_called_once()
        mock_send_mail.assert_called_once()

        # Unpacking email pairs for easier assertions
        args, _ = mock_send_mail.call_args
        email_pairs = args[0]

        self.assertEqual(len(email_pairs), 1)
        self.assertEqual(email_pairs[0][0], 'staff2@example.com')
        self.assertIn("Hello there, Jane!", email_pairs[0][1])

    @patch('app.create_connection_users')
    @patch('app.send_mail')
    def test_send_reminders_with_deleted_staff(self, mock_send_mail, mock_create_connection_users):
        # Mocking the database connection and cursor
        mock_conn = Mock()
        mock_cur = Mock()
        mock_create_connection_users.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cur

        # Mocking the database results
        mock_cur.fetchall.return_value = [
            (1, 'staff1@example.com', 'staff1', 'John Doe', 1, 1, 1),
            (2, 'staff2@example.com', 'staff2', 'Jane Smith', 1, 1, 0)
        ]

        # Running the function
        send_reminders()

        # Assertions
        mock_cur.execute.assert_called_once()
        mock_send_mail.assert_called_once()

        # Unpacking email pairs for easier assertions
        args, _ = mock_send_mail.call_args
        email_pairs = args[0]

        self.assertEqual(len(email_pairs), 1)
        self.assertEqual(email_pairs[0][0], 'staff2@example.com')
        self.assertIn("Hello there, Jane!", email_pairs[0][1])

    @patch('app.create_connection_users')
    @patch('app.send_mail')
    def test_send_reminders_with_no_staff(self, mock_send_mail, mock_create_connection_users):
        # Mocking the database connection and cursor
        mock_conn = Mock()
        mock_cur = Mock()
        mock_create_connection_users.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cur

        # Mocking the database results
        mock_cur.fetchall.return_value = []

        # Running the function
        send_reminders()

        # Assertions
        mock_cur.execute.assert_called_once()
        mock_send_mail.assert_not_called()
        mock_conn.cursor.assert_called_once()
        mock_conn.close.assert_called_once()

    def tearDown(self):
        # Any tear down operations can be added here
        pass


if __name__ == '__main__':
    unittest.main()
