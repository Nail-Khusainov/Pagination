import Head from "next/head";
import { Inter } from "next/font/google";
import Table from "react-bootstrap/Table";
import { Alert, Container, Button } from "react-bootstrap";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useState } from 'react';

const inter = Inter({ subsets: ["latin"] });

type TUserItem = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  updatedAt: string
}

type TGetServerSideProps = {
  statusCode: number
  users: TUserItem[]
}

export const getServerSideProps: GetServerSideProps<TGetServerSideProps> = async (ctx: GetServerSidePropsContext) => {
  try {
    const pageNumber = 1;
    const take = 20;
    const skip = (pageNumber - 1) * take;

    const res = await fetch(`http://localhost:3000/users/page?skip=${skip}&take=${take}`, { method: 'GET' });

    if (!res.ok) {
      return { props: { statusCode: res.status, users: [], totalUsers: 5000 } };
    }

    const users = await res.json();

    return {
      props: { statusCode: 200, users, totalUsers: 5000 }
    };
  } catch (e) {
    return { props: { statusCode: 500, users: [], totalUsers: 5000 } };
  }
};

export default function Home({ statusCode, users, totalUsers }: TGetServerSideProps & { totalUsers: number }) {
  const [currentPage, setCurrentPage] = useState(1);
  const take = 20;
  const totalPages = Math.ceil(totalUsers / take);
  const [curUsers, setCurUsers] = useState<TUserItem[]>(users);

  const handlePageChange = async (pageNumber: number) => {
    setCurrentPage(pageNumber);
    console.log(pageNumber);

    try {
      const skip = (pageNumber - 1) * take; // количество пропущенных юзеров
      console.log({ skip });

      const res = await fetch(`http://localhost:3000/users/page?skip=${skip}&take=${take}`, { method: 'GET' });

      if (!res.ok) {
        throw new Error(`Ошибка ${res.status} при загрузке данных`);
      }

      const users = await res.json();
      setCurUsers(users);

    } catch (error) {
      console.error(error);
    }
  };

  if (statusCode !== 200) {
    return <Alert variant={'danger'}>Ошибка {statusCode} при загрузке данных</Alert>
  }

  return (
    <>
      <Head>
        <title>Тестовое задание</title>
        <meta name="description" content="Тестовое задание" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={inter.className}>
        <Container>
          <h1 className={'mb-5'}>Пользователи</h1>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Фамилия</th>
                <th>Телефон</th>
                <th>Email</th>
                <th>Дата обновления</th>
              </tr>
            </thead>
            <tbody>
              {
                curUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.firstname}</td>
                    <td>{user.lastname}</td>
                    <td>{user.phone}</td>
                    <td>{user.email}</td>
                    <td>{user.updatedAt}</td>
                  </tr>
                ))
              }
            </tbody>
          </Table>

          <div className="pagination">
            <Button disabled={currentPage < 11} onClick={() => handlePageChange(currentPage - 10)}>«</Button>
            <Button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>{'<'}</Button>
            {Array.from({ length: Math.min(totalPages - currentPage + 1, 10) }, (_, i) => {
              const pageNumber = currentPage + i;
              return (
                <Button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  style={{ backgroundColor: currentPage === pageNumber ? 'blue' : 'transparent', color: currentPage === pageNumber ? 'white' : 'black' }}
                >
                  {pageNumber}
                </Button>
              );
            })}
            <Button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>{'>'}</Button>
            <Button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 10)}>»</Button>
          </div>

        </Container>
      </main>
    </>
  );
}
