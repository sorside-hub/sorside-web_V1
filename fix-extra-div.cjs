const fs = require('fs');
let code = fs.readFileSync('src/pages/About/About.tsx', 'utf-8');

// There is an extra </div> left over because of the previous sed/replace
// Let's replace the ending to be valid JSX
code = code.replace(
`      </div>

      </div>
  );
};`,
`      </div>
    </div>
  );
};`
);

fs.writeFileSync('src/pages/About/About.tsx', code);
console.log('Fixed extra div.');
