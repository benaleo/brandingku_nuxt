<template>
  <p>There are {{ data?.getUsers?.length || 0 }} users.</p>
  <ul>
    <li v-for="user in data?.getUsers" :key="user.id">
      {{ user.name }} - {{ user.email }} - {{ user.phone }}
    </li>
  </ul>
</template>

<script lang="ts" setup>
interface User {
  id: string
  name: string
  email: string
  phone: string
}

interface QueryResponse {
  getUsers: User[]
}

const query = gql`
  query {
    getUsers {
        id
        name
        email
        phone
    }
}
`
const variables = { limit: 10 }

const { data } = await useAsyncQuery<QueryResponse>(query, variables)
</script>
